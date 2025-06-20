package com.example.audioai.service;

import com.example.audioai.util.FileUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.nio.file.Path;
import static org.junit.jupiter.api.Assertions.*;

class AudioTranscriptionServiceTest {
    private AudioTranscriptionService service;
    private FileUtil fileUtil;

    @BeforeEach
    void setUp() {
        fileUtil = new FileUtil("test-output");
        service = new AudioTranscriptionService(fileUtil);
    }

    @Test
    void testSaveTranscription() throws Exception {
        String transcription = "This is a transcription.";
        Path result = service.saveTranscription(transcription);
        assertTrue(result.toString().endsWith(".md"));
        assertTrue(java.nio.file.Files.exists(result));
        java.nio.file.Files.deleteIfExists(result);
    }
} 