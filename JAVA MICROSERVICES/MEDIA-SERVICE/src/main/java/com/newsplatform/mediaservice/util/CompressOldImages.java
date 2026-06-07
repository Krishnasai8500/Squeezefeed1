package com.newsplatform.mediaservice.util;

import net.coobird.thumbnailator.Thumbnails;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;

public class CompressOldImages {

    public static void main(String[] args) throws Exception {

        File folder =
                new File("C:/Users/DELL/news-app-uploads - Copy");

        File[] files = folder.listFiles();

        if (files == null) {
            System.out.println("No files found");
            return;
        }

        int converted = 0;

        for (File file : files) {

            String name = file.getName().toLowerCase();

            if (!name.endsWith(".png")
                    && !name.endsWith(".jpg")
                    && !name.endsWith(".jpeg")) {
                continue;
            }

            String webpName =
                    file.getName()
                            .replaceAll("\\.[^.]+$", ".webp");

            File webpFile =
                    new File(folder, webpName);

            try {

                BufferedImage image =
                        Thumbnails.of(file)
                                .size(1080, 1920)
                                .asBufferedImage();

                ImageIO.write(
                        image,
                        "webp",
                        webpFile
                );

                if (webpFile.exists()) {

                    boolean deleted =
                            file.delete();

                    System.out.println(
                            "Converted: " +
                                    file.getName() +
                                    " -> " +
                                    webpName +
                                    " | deleted original = " +
                                    deleted
                    );

                    converted++;
                }

            } catch (Exception e) {

                System.out.println(
                        "Failed: " +
                                file.getName() +
                                " : " +
                                e.getMessage()
                );
            }
        }

        System.out.println(
                "\nFinished. Converted files: " +
                        converted
        );
    }
}