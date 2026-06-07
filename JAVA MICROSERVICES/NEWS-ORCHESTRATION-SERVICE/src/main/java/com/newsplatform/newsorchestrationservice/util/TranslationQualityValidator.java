package com.newsplatform.newsorchestrationservice.util;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class TranslationQualityValidator {

    public boolean isValidTitle(
            String original,
            String translated
    ) {

        if (translated == null || translated.isBlank()) {
            return false;
        }

        if (original == null || original.isBlank()) {
            return true;
        }

        String[] words =
                translated.trim().split("\\s+");

        if (words.length == 0) {
            return false;
        }

        // Rule 1: Translation Explosion
        if (translated.length() > original.length() * 3) {
            return false;
        }

        // Rule 2: Repetition Ratio
        Set<String> uniqueWords =
                new HashSet<>(Arrays.asList(words));

        double ratio =
                (double) uniqueWords.size() / words.length;

        if (ratio < 0.5) {
            return false;
        }

        // Rule 3: Too many words
        if (words.length > 35) {
            return false;
        }

        // Rule 4: Same word repeated too much
        Map<String, Integer> frequency =
                new HashMap<>();

        int maxFrequency = 0;

        for (String word : words) {

            int count =
                    frequency.getOrDefault(word, 0) + 1;

            frequency.put(word, count);

            maxFrequency =
                    Math.max(maxFrequency, count);
        }

        if (maxFrequency > 4) {
            return false;
        }

        return true;
    }
}