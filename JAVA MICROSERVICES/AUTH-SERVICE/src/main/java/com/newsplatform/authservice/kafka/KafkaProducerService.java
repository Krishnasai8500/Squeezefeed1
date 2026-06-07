package com.newsplatform.authservice.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publishEvent(
            String topic,
            Map<String, Object> payload
    ) {

        try {

            String message =
                    objectMapper.writeValueAsString(payload);

            kafkaTemplate.send(topic, message);

            log.info(
                    "Published event to topic: {}",
                    topic
            );

        } catch (Exception e) {

            log.error(
                    "Failed to publish event: {}",
                    e.getMessage()
            );
        }
    }
}