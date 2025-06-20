package com.example.audioai.service;

import com.example.audioai.util.FileUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class GptSummarizationService {
    @Value("${spring.ai.openai.api-key}")
    private String openAiApiKey;

    @Value("${spring.ai.openai.base-url}")
    private String openAiBaseUrl;

    private static final String MODEL = "gpt-4.1-mini"; // or gpt-4 if available
    private static final String CHAT_COMPLETIONS_ENDPOINT = "/chat/completions";

    private final FileUtil fileUtil;

    @Autowired
    public GptSummarizationService(FileUtil fileUtil) {
        this.fileUtil = fileUtil;
    }

    public String summarize(String transcription) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = openAiBaseUrl + CHAT_COMPLETIONS_ENDPOINT;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", MODEL);
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", "You are a helpful assistant that summarizes meeting transcripts."),
                    Map.of("role", "user", "content", "Summarize the following transcript in clear, concise language, capturing the key ideas and main points.\n\n" + transcription)
            ));
            requestBody.put("temperature", 0.2);
            requestBody.put("max_tokens", 512);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    return (String) message.get("content");
                }
            }
            throw new RuntimeException("Failed to summarize transcription: " + response.getStatusCode());
        } catch (Exception e) {
            throw new RuntimeException("Error during transcription summarization", e);
        }
    }

    public Path saveSummary(String summary) {
        String fileName = fileUtil.generateTimestampedFileName("summary", "md");
        return fileUtil.saveToFile(summary, fileName);
    }
} 