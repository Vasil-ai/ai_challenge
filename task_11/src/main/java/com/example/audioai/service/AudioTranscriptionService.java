package com.example.audioai.service;

import com.example.audioai.util.FileUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.io.FileSystemResource;
import org.springframework.beans.factory.annotation.Autowired;

import java.nio.file.Path;

@Service
public class AudioTranscriptionService {
    @Value("${spring.ai.openai.api-key}")
    private String openAiApiKey;

    @Value("${spring.ai.openai.base-url}")
    private String openAiBaseUrl;

    private static final String MODEL = "whisper-1";
    private static final String TRANSCRIPTION_ENDPOINT = "/audio/transcriptions";

    private final FileUtil fileUtil;

    @Autowired
    public AudioTranscriptionService(FileUtil fileUtil) {
        this.fileUtil = fileUtil;
    }

    public String transcribeAudio(Path audioPath) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = openAiBaseUrl + TRANSCRIPTION_ENDPOINT;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setBearerAuth(openAiApiKey);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new FileSystemResource(audioPath));
            body.add("model", MODEL);
            body.add("response_format", "text");

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            } else {
                throw new RuntimeException("Failed to transcribe audio: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new RuntimeException("Error during audio transcription", e);
        }
    }

    public Path saveTranscription(String transcription) {
        String fileName = fileUtil.generateTimestampedFileName("transcription", "md");
        return fileUtil.saveToFile(transcription, fileName);
    }
} 