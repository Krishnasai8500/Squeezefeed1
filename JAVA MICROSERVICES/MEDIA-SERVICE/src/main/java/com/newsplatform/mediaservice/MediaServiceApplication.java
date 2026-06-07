package com.newsplatform.mediaservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;
import javax.imageio.ImageIO;

@SpringBootApplication
public class MediaServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MediaServiceApplication.class, args);
	}

	@PostConstruct
	public void testWebP() {

		System.out.println("===== IMAGE WRITER FORMATS =====");

		String[] formats = ImageIO.getWriterFormatNames();

		for (String format : formats) {
			System.out.println(format);
		}

		System.out.println("===============================");
	}
}