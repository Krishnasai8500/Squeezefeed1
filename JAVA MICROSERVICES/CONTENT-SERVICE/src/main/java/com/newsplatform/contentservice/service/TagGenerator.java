package com.newsplatform.contentservice.service;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class TagGenerator {

    public List<String> generateTags(
            String title,
            String summary
    ) {

        String text = (
                title + " " + summary
        ).toLowerCase();

        List<String> tags = new ArrayList<>();

        // Technology
        if (

                        text.contains("openai") ||
                        text.contains("google") ||
                        text.contains("apple") ||
                        text.contains("startup")
        ) {
            tags.add("technology");
        }

        // Finance
        if (
                text.contains("stock") ||
                        text.contains("market") ||
                        text.contains("petrol") ||
                        text.contains("inflation") ||
                        text.contains("diesel") ||
                        text.contains("economy")
        ) {
            tags.add("finance");
        }

        // Politics
        if (
                text.contains("modi") ||
                        text.contains("bjp") ||
                        text.contains("congress") ||
                        text.contains("election") ||
                        text.contains("government")
        ) {
            tags.add("politics");
        }

        // Sports
        if (
                text.contains("ipl") ||
                        text.contains("cricket") ||
                        text.contains("football") ||
                        text.contains("tennis")
        ) {
            tags.add("sports");
        }

        // Entertainment
        if (
                text.contains("actor") ||
                        text.contains("movie") ||
                        text.contains("bollywood") ||
                        text.contains("ott")
        ) {
            tags.add("entertainment");
        }

        // Education
        if (
                text.contains("iit") ||
                        text.contains("jee") ||
                        text.contains("neet") ||
                        text.contains("exam")
        ) {
            tags.add("education");
        }

        // International
        if (
                text.contains("iran") ||
                        text.contains("usa") ||
                        text.contains("uae") ||
                        text.contains("china")
        ) {
            tags.add("international");
        }

        // Meme-News / Middle-Class
        if (
                text.contains("salary") ||
                        text.contains("emi") ||
                        text.contains("middle class") ||
                        text.contains("maggi")
        ) {
            tags.add("meme-news");
        }

        if (tags.isEmpty()) {
            tags.add("general");
        }

        return tags;
    }
}