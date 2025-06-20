package com.example.audioai.service;

import com.example.audioai.model.AnalyticsResult;
import com.example.audioai.model.TopicMention;
import com.example.audioai.util.FileUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import javax.sound.sampled.AudioFileFormat;
import javax.sound.sampled.AudioSystem;
import java.io.File;
import java.nio.file.Path;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AnalyticsService {
    @Value("${spring.ai.openai.api-key}")
    private String openAiApiKey;

    @Value("${spring.ai.openai.base-url}")
    private String openAiBaseUrl;

    private static final String MODEL = "gpt-4.1-mini";
    private static final String CHAT_COMPLETIONS_ENDPOINT = "/chat/completions";

    private final FileUtil fileUtil;

    @Autowired
    public AnalyticsService(FileUtil fileUtil) {
        this.fileUtil = fileUtil;
    }

    public AnalyticsResult analyze(String transcription, Path audioPath) {
        int wordCount = countWords(transcription);
        double durationMinutes = getAudioDurationMinutes(audioPath);
        double wpm = durationMinutes > 0 ? wordCount / durationMinutes : 0;
        List<TopicMention> topics = extractTopicsWithGpt(transcription);
        return new AnalyticsResult(wordCount, wpm, topics);
    }

    private int countWords(String text) {
        if (text == null || text.isBlank()) return 0;
        String[] words = text.trim().split("\\s+");
        return words.length;
    }

    private double getAudioDurationMinutes(Path audioPath) {
        try {
            File audioFile = audioPath.toFile();
            AudioFileFormat fileFormat = AudioSystem.getAudioFileFormat(audioFile);
            Map<?, ?> properties = fileFormat.properties();
            Long microseconds = (Long) properties.get("duration");
            if (microseconds != null) {
                return microseconds / 1_000_000.0 / 60.0;
            }
        } catch (Exception e) {
            // fallback: unknown duration
        }
        return 1.0; // fallback to 1 minute to avoid division by zero
    }

    private List<TopicMention> extractTopicsWithGpt(String transcription) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = openAiBaseUrl + CHAT_COMPLETIONS_ENDPOINT;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiApiKey);

            String prompt = "Extract the top 3 or more frequently mentioned topics from the following transcript. " +
                    "For each topic, provide the topic name and the number of times it is mentioned. " +
                    "If there are no clear topics, make your best guess based on the content. " +
                    "Respond ONLY in JSON array format: [{\"topic\":\"...\", \"mentions\":N}, ...]. Transcript:\n" + transcription;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", MODEL);
            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", "You are an analytics assistant."),
                    Map.of("role", "user", "content", prompt)
            ));
            requestBody.put("temperature", 0.2);
            requestBody.put("max_tokens", 256);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    System.out.println("Raw GPT topic extraction response:\n" + content); // Log raw response
                    return parseTopicsJson(content);
                }
            }
        } catch (Exception e) {
            System.err.println("Error during GPT topic extraction: " + e.getMessage());
        }
        return Collections.emptyList();
    }

    List<TopicMention> parseTopicsJson(String json) {
        List<TopicMention> topics = new ArrayList<>();
        try {
            // Extract the first JSON array from the response
            java.util.regex.Pattern arrayPattern = java.util.regex.Pattern.compile("(\\[.*?\\])", java.util.regex.Pattern.DOTALL);
            java.util.regex.Matcher matcher = arrayPattern.matcher(json);
            if (matcher.find()) {
                String jsonArray = matcher.group(1);
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                TopicMention[] arr = mapper.readValue(jsonArray, TopicMention[].class);
                topics = Arrays.asList(arr);
            } else {
                System.err.println("No JSON array found in GPT response.");
            }
        } catch (Exception e) {
            System.err.println("Failed to parse topics JSON: " + e.getMessage());
        }
        return topics;
    }

    public Path saveAnalytics(AnalyticsResult analytics) {
        String fileName = fileUtil.generateTimestampedFileName("analysis", "json");
        return fileUtil.saveToFile(analytics.toPrettyJson(), fileName);
    }
} 