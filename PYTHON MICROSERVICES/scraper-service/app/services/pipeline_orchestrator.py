from app.services.rss_scraper import scrape_rss_feed
from app.services.article_extractor import extract_article
from app.services.fallback_extractor import fallback_extract
from app.services.content_cleaner import clean_content
from app.services.duplicate_checker import is_duplicate
from app.core.source_registry import SOURCE_PRIORITY
from app.core.logging import logger
from app.services.og_image_extractor import extract_og_image
from app.services.trafilatura_extractor import trafilatura_extract
from app.services.location_classifier import detect_article_location

# ✅ THIS WAS MISSING — add it here
def clean_image_url(url):
    if not url:
        return None
    url = url.strip()
    if not url.startswith("http"):
        return None
    return url

def process_rss_pipeline(
    feed_url: str,
    db,
    category: str,
    source_name: str,
    source_type: str = "english"
):
    articles = scrape_rss_feed(
        feed_url,
        source_type
    )
    duplicate_skipped = 0
    processed_articles = []

    for article_data in articles:

        if is_duplicate(db, article_data["link"]):
            logger.info(f"DUPLICATE SKIPPED: {article_data['link']}")
            duplicate_skipped += 1
            continue

        # ✅ MOVE THIS OUTSIDE try/except — so it's never lost
        rss_image = clean_image_url(article_data.get("image_url"))

        logger.info(f"RAW RSS IMAGE FROM SCRAPER: {article_data.get('image_url')}")  # ADD THIS
        logger.info(f"CLEANED RSS IMAGE: {rss_image}")  # ADD THIS



        try:
            full_article = extract_article(article_data["link"])

            extracted_image = clean_image_url(full_article.get("image_url"))

            og_image = None
            if not rss_image and not extracted_image:
                og_image = clean_image_url(extract_og_image(article_data["link"]))

            logger.info(f"RSS IMAGE: '{rss_image}'")
            logger.info(f"EXTRACTED IMAGE: '{extracted_image}'")
            logger.info(f"OG IMAGE: '{og_image}'")

            full_article["image_url"] = (
                rss_image or
                extracted_image or
                og_image or
                "https://placehold.co/1280x720?text=NewsAI"
            )

            logger.info(f"FINAL IMAGE SELECTED: {full_article['image_url']}")

        except Exception:
            logger.info(f"Trying trafilatura extraction for: {article_data['link']}")
            trafilatura_article = trafilatura_extract(article_data["link"])

            if trafilatura_article:
                full_article = trafilatura_article
                if not full_article.get("title"):
                    full_article["title"] = article_data.get("title")
            else:
                fallback_article = fallback_extract(article_data["link"])
                if not fallback_article:
                    continue

                full_article = {
                    "title": article_data.get("title"),
                    "content": fallback_article["content"],
                    "summary": article_data.get("summary", ""),
                    "author": article_data.get("author"),
                    "publish_date": article_data.get("published"),
                    "keywords": [],
                    "source_url": article_data["link"]
                }

            # ✅ rss_image is available here because it's outside try/except
            full_article["image_url"] = rss_image or "https://placehold.co/1280x720?text=NewsAI"

        full_article["content"] = clean_content(full_article["content"])
        location_data = detect_article_location(
            full_article["title"],
            full_article["content"]

        )
        print("DETECTED LOCATION:", location_data)

        full_article["article_city"] = location_data["city"]

        full_article["article_state"] = location_data["state"]
        full_article["language"] = article_data.get(
            "language",
            "ENGLISH"
        )
        full_article["tags"] = [category, "Breaking News"] if category else ["General", "Breaking News"]
        full_article["source_name"] = source_name
        full_article["category"] = category

        if not full_article.get("image_url"):
            full_article["image_url"] = "https://placehold.co/1280x720?text=NewsAI"

        if not full_article.get("summary"):
            full_article["summary"] = (full_article.get("content", "")[:200] + "...") \
                if full_article.get("content") else "No summary available."

        source_score = 5
        for source_key, score in SOURCE_PRIORITY.items():
            if source_key.lower() in source_name.lower():
                source_score = score
                break

        full_article["source_score"] = source_score
        processed_articles.append(full_article)

    logger.info(f"""
        PIPELINE STATS:
        Total RSS Articles: {len(articles)}
        Duplicates Skipped: {duplicate_skipped}
        Successfully Processed: {len(processed_articles)}
    """)

    return {
        "processed_articles": processed_articles,
        "total_scraped": len(articles),
        "duplicates_skipped": duplicate_skipped
    }