package com.newsplatform.newsorchestrationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NewsOrchestrationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(NewsOrchestrationServiceApplication.class, args);
	}

}
