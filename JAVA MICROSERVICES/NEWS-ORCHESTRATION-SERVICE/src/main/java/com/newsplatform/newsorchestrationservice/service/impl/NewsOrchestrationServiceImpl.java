package com.newsplatform.newsorchestrationservice.service.impl;

import com.newsplatform.newsorchestrationservice.client.ContentServiceClient;
import com.newsplatform.newsorchestrationservice.client.HumanizationServiceClient;
import com.newsplatform.newsorchestrationservice.client.ImageGenerationServiceClient;
import com.newsplatform.newsorchestrationservice.client.PromptServiceClient;
import com.newsplatform.newsorchestrationservice.client.ScraperServiceClient;
import com.newsplatform.newsorchestrationservice.client.SentimentServiceClient;

import com.newsplatform.newsorchestrationservice.dto.ContentPublishRequest;
import com.newsplatform.newsorchestrationservice.dto.ImageGenerationRequest;
import com.newsplatform.newsorchestrationservice.dto.ImageGenerationResponse;
import com.newsplatform.newsorchestrationservice.dto.ProcessedArticleResponse;
import com.newsplatform.newsorchestrationservice.dto.PromptGenerationRequest;
import com.newsplatform.newsorchestrationservice.dto.PromptGenerationResponse;
import com.newsplatform.newsorchestrationservice.dto.ScrapedArticleRequest;

import com.newsplatform.newsorchestrationservice.entity.ProcessedStoryFingerprint;
import com.newsplatform.newsorchestrationservice.repository.ProcessedStoryFingerprintRepository;
import com.newsplatform.newsorchestrationservice.service.NewsOrchestrationService;

import com.newsplatform.newsorchestrationservice.util.TranslationQualityValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.*;
import java.util.stream.Collectors;
import com.newsplatform.newsorchestrationservice.util.StoryFingerprintUtil;

@Service
@RequiredArgsConstructor
public class NewsOrchestrationServiceImpl implements NewsOrchestrationService {


    private final ScraperServiceClient scraperServiceClient;
    private final HumanizationServiceClient humanizationServiceClient;
    private final SentimentServiceClient sentimentServiceClient;
    private final PromptServiceClient promptServiceClient;
    private final ImageGenerationServiceClient imageGenerationServiceClient;
    private final ContentServiceClient contentServiceClient;
    private final TranslationQualityValidator translationQualityValidator;
    private final StoryFingerprintUtil storyFingerprintUtil;
    private final ProcessedStoryFingerprintRepository
            processedStoryFingerprintRepository;

    // ── Fallback image maps ───────────────────────────────────────────────────

    private static final Map<String, String> CATEGORY_FALLBACK_IMAGES = Map.ofEntries(
            Map.entry("sports",        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800"),
            Map.entry("finance",       "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800"),
            Map.entry("tech",          "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"),
            Map.entry("technology",    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800"),
            Map.entry("entertainment", "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=800"),
            Map.entry("world",         "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800"),
            Map.entry("politics",      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800"),
            Map.entry("health",        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800"),
            Map.entry("science",       "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800"),
            Map.entry("crime",         "https://images.unsplash.com/photo-1453873531674-2151bcd01707?w=800"),
            Map.entry("general",       "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800")
    );

    private static final String ULTIMATE_FALLBACK =
            "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800";

    private String getCategoryFallbackImage(String category) {
        if (category == null || category.isBlank()) return ULTIMATE_FALLBACK;
        return CATEGORY_FALLBACK_IMAGES.getOrDefault(
                category.toLowerCase().trim(),
                ULTIMATE_FALLBACK
        );
    }

    @Override
    public void ingestAndPublishNews(String jwtToken) {

        List<ScrapedArticleRequest> scrapedArticles =
                scraperServiceClient.fetchLatestNews();

        Map<String, List<ContentPublishRequest>>
                highCategoryMap = new LinkedHashMap<>();

        Map<String, List<ContentPublishRequest>>
                midCategoryMap = new LinkedHashMap<>();


        for (ScrapedArticleRequest article : scrapedArticles) {

            try {
                // Helper: best raw text from scraper
                String bestRawContent =
                        article.getRawContent() != null
                                && !article.getRawContent().isBlank()
                                && article.getRawContent().length() > 300

                                ? article.getRawContent()

                                : article.getDescription() != null
                                && !article.getDescription().isBlank()

                                ? article.getDescription()

                                : article.getTitle();
                bestRawContent = bestRawContent
                        .replaceAll("(?i)follow us.*", "")
                        .replaceAll("(?i)subscribe.*", "")
                        .replaceAll("(?i)click here.*", "")
                        .replaceAll("(?i)youtube.*", "")
                        .replaceAll("(?i)instagram.*", "")
                        .trim();

                if (bestRawContent.length() > 5000) {

                    bestRawContent =
                            bestRawContent.substring(0, 5000);
                }


                if (bestRawContent.length() < 120) {

                    System.out.println(
                            "LOW QUALITY ARTICLE SKIPPED: "
                                    + article.getTitle()
                    );

                    continue;
                }
                // Short summary (max 200 chars) for summary field
                String shortSummary = bestRawContent.length() > 200
                        ? bestRawContent.substring(0, 200) + "..."
                        : bestRawContent;



                String storyKey =
                        storyFingerprintUtil.buildFingerprint(
                                article.getTitle(),
                                article.getDescription(),
                                article.getCategory()
                        );


                boolean alreadyProcessed =
                        processedStoryFingerprintRepository
                                .existsByFingerprintAndCreatedAtAfter(
                                        storyKey,
                                        LocalDateTime.now()
                                                .minusHours(48)
                                );

                if (alreadyProcessed) {

                    System.out.println(
                            "DB DUPLICATE STORY SKIPPED: "
                                    + article.getTitle()
                    );

                    scraperServiceClient.markArticleProcessed(
                            article.getId()
                    );

                    continue;
                }

                // Step 1: Humanize content
                article.setRawContent(bestRawContent);
                ProcessedArticleResponse processed =
                        humanizationServiceClient.humanizeContent(article);

                System.out.println("HUMANIZED CONTENT:");
                System.out.println(processed.getRewritten_content());

                System.out.println("CATEGORY:");
                System.out.println(processed.getCategory());

                System.out.println("TAGS:");
                System.out.println(processed.getTags());


                System.out.println("TRANSLATIONS DEBUG:");
                System.out.println(processed.getTranslations());


                // Step 2: Analyze sentiment
                String textToAnalyze = processed.getRewritten_content() != null
                        ? processed.getRewritten_content()
                        : bestRawContent;

                Double sentimentScore =
                        sentimentServiceClient.analyzeSentiment(
                                article.getTitle(),
                                textToAnalyze,
                                processed.getCategory(),
                                processed.getTags(),
                                article.getPublishedAt()
                        );

                if (sentimentScore == null) sentimentScore = 0.5;

                boolean trending = sentimentScore >= 0.7;

                // Step 3: Build safe tags
                List<String> tags =
                        processed.getTags() != null
                                && !processed.getTags().isEmpty()

                                ? processed.getTags()

                                : article.getTags() != null
                                ? article.getTags()
                                : new ArrayList<>();

                // Step 4: Resolve category FIRST
                String category = (processed.getCategory() != null && !processed.getCategory().isBlank())
                        ? processed.getCategory().toLowerCase().trim()
                        : (article.getCategory() != null
                        ? article.getCategory().toLowerCase().trim()
                        : "general");

                // Step 4: Build safe imageUrl
                String scraperImage = article.getImageUrl();

                boolean validImage =
                        scraperImage != null
                                && !scraperImage.isBlank()
                                && !scraperImage.contains("placehold.co");

                String imageUrl = validImage
                        ? scraperImage
                        : getCategoryFallbackImage(category);


                System.out.println(processed.getRewritten_content());
                if (processed.getRewritten_content() != null) {
                    System.out.println(processed.getRewritten_content().length());
                } else {
                    System.out.println("Humanization returned null");
                }

                Map<String, String> translatedTitles =
                        processed.getTranslations() != null
                                ? processed.getTranslations().get("title")
                                : null;

                String englishTitle =
                        translatedTitles != null
                                ? translatedTitles.getOrDefault("en", "")
                                : "";

                if (!translationQualityValidator.isValidTitle(
                        article.getTitle(),
                        englishTitle
                )) {

                    System.out.println(
                            "INVALID TRANSLATION DETECTED: "
                                    + article.getTitle()
                    );

                    System.out.println(
                            "ORIGINAL: " + article.getTitle()
                    );

                    System.out.println(
                            "TRANSLATED: " + englishTitle
                    );

                    englishTitle = article.getTitle();

                    if (
                            processed.getViral_headline() != null
                                    &&
                                    processed.getViral_headline().length() > 15
                                    &&
                                    !processed.getViral_headline().startsWith("Why")
                                    &&
                                    !processed.getViral_headline().startsWith("However")
                                    &&
                                    !processed.getViral_headline().startsWith("This")
                                    &&
                                    !processed.getViral_headline().startsWith("These")
                    ) {

                        englishTitle =
                                processed.getViral_headline();
                    }
                }

                if (translatedTitles != null) {

                    translatedTitles.put(
                            "en",
                            englishTitle
                    );
                }

                // Step 5: Build publish request ONLY — no publish/save here
                ContentPublishRequest publishRequest =
                        ContentPublishRequest.builder()
                                .title(article.getTitle() != null
                                        ? article.getTitle()
                                        : "Breaking News")
                                .description(bestRawContent.length() > 4000
                                        ? bestRawContent.substring(0, 4000)
                                        : bestRawContent)
                                .fullContent("")
                                .summary(processed.getRewritten_content() != null
                                        ? processed.getRewritten_content()
                                        : shortSummary)
                                .translatedTitle(
                                        translatedTitles
                                )
                                .translatedSummary(
                                        processed.getTranslations() != null
                                                ? processed.getTranslations().get("summary")
                                                : null
                                )
                                .author(article.getAuthor() != null
                                        ? article.getAuthor()
                                        : "NewsAI")
                                .sourceUrl(article.getSourceUrl())
                                .category(category)
                                .language("ENGLISH")
                                .tags(tags)
                                .imageUrl(imageUrl)
                                .isPublished(true)
                                .isTrending(trending)
                                .viralScore(sentimentScore)
                                .storyFingerprint(storyKey)
                                .build();

                if (trending) {

                    highCategoryMap
                            .computeIfAbsent(
                                    category,
                                    k -> new ArrayList<>()
                            )
                            .add(publishRequest);

                } else {

                    midCategoryMap
                            .computeIfAbsent(
                                    category,
                                    k -> new ArrayList<>()
                            )
                            .add(publishRequest);
                }

                System.out.println("Queued for selection: " + publishRequest.getTitle());
                System.out.println("Summary: " + publishRequest.getSummary());
                System.out.println("FullContent length: " + publishRequest.getFullContent().length());
                System.out.println("Image URL: " + publishRequest.getImageUrl());
                System.out.println("Trending: " + publishRequest.getIsTrending());
                System.out.println(
                        "ARTICLE SUCCESSFULLY INGESTED: " + article.getId()
                );

                scraperServiceClient.markArticleProcessed(
                        article.getId()
                );

            } catch (Exception e) {

                System.out.println(
                        "FAILED ARTICLE ID = "
                                + article.getId()
                );

                System.out.println(
                        "FAILED ARTICLE TITLE = "
                                + article.getTitle()
                );

                System.out.println(
                        "ERROR = "
                                + e.getMessage()
                );

                e.printStackTrace();
            }
        }

        System.out.println(
                "FINISHED PROCESSING ALL ARTICLES"
        );
        List<ContentPublishRequest>
                selectedArticles = new ArrayList<>();

        for (
                List<ContentPublishRequest> categoryArticles
                : highCategoryMap.values()
        ) {

            selectedArticles.addAll(

                    categoryArticles.stream()

                            .sorted(
                                    Comparator.comparing(
                                            ContentPublishRequest::getViralScore
                                    ).reversed()
                            )

                            .limit(3)

                            .toList()
            );
        }

        for (
                List<ContentPublishRequest> categoryArticles
                : midCategoryMap.values()
        ) {

            selectedArticles.addAll(

                    categoryArticles.stream()

                            .sorted(
                                    Comparator.comparing(
                                            ContentPublishRequest::getViralScore
                                    ).reversed()
                            )

                            .limit(2)

                            .toList()
            );
        }

        System.out.println("REACHED SELECTION STAGE");
        System.out.println(
                "SELECTED ARTICLES COUNT = "
                        + selectedArticles.size()
        );

        // Final loop: article is ContentPublishRequest — safe to call publishContent + save fingerprint
        for (
                ContentPublishRequest article
                : selectedArticles
        ) {

            try{
                System.out.println(
                        "ABOUT TO PUBLISH: "
                                + article.getTitle()
                );

                System.out.println(
                        "FINGERPRINT: "
                                + article.getStoryFingerprint()
                );
                contentServiceClient.publishContent(
                        article,
                        jwtToken
                );

                if (article.getStoryFingerprint() != null) {

                    ProcessedStoryFingerprint fingerprint =
                            ProcessedStoryFingerprint.builder()
                                    .fingerprint(
                                            article.getStoryFingerprint()
                                    )
                                    .build();

                    System.out.println(
                            "SAVING FINGERPRINT: "
                                    + article.getStoryFingerprint()
                    );

                    if (!processedStoryFingerprintRepository
                            .existsByFingerprint(
                                    article.getStoryFingerprint()
                            )) {

                        processedStoryFingerprintRepository.save(
                                fingerprint
                        );
                    }

                }

                System.out.println(
                        "FINAL ORCHESTRATED PUBLISH: "
                                + article.getTitle()
                );
            }

            catch (Exception e) {

                System.out.println(
                        "PUBLISH FAILED: "
                                + article.getTitle()
                );

                e.printStackTrace();
            }

        }
    }
}