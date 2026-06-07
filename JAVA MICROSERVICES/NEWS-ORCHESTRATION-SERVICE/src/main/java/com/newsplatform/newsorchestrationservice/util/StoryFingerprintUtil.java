package com.newsplatform.newsorchestrationservice.util;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.*;
@Component
public class StoryFingerprintUtil {

    private static final Set<String> STOP_WORDS =
            Set.of(
                    "announces",
                    "announce",
                    "announced",
                    "says",
                    "said",
                    "become",
                    "becomes",
                    "becoming",
                    "today",
                    "latest",
                    "breaking",
                    "news",
                    "sworn",
                    "hoped",
                    "lives",
                    "family",
                    "father"
            );

    public String buildFingerprint(
            String title,
            String description,
            String category
    ) {

        String source =
                (title != null ? title : "")
                        + " "
                        + (description != null ? description : "")
                        + " "
                        + (category != null ? category : "");

        String normalized = source
                .toLowerCase()
                .replaceAll("[^a-zA-Z0-9 ]", " ")
                .trim();

        String[] words =
                normalized.split("\\s+");

        String fingerprint =
                Arrays.stream(words)
                        .filter(word -> word.length() > 4)
                        .filter(word -> !STOP_WORDS.contains(word))
                        .distinct()
                        .limit(15)
                        .collect(Collectors.joining("_"));

        if (fingerprint.length() < 15) {

            fingerprint =
                    fingerprint + "_"
                            + Math.abs(source.hashCode());
        }

        return fingerprint;
    }
}