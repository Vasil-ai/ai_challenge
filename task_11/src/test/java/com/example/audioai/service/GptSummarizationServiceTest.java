package com.example.audioai.service;

import com.example.audioai.util.FileUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.nio.file.Path;
import static org.junit.jupiter.api.Assertions.*;

class GptSummarizationServiceTest {
    private GptSummarizationService service;
    private FileUtil fileUtil;

    @BeforeEach
    void setUp() {
        fileUtil = new FileUtil("test-output");
        service = new GptSummarizationService(fileUtil);
    }

    @Test
    void testSaveSummary() throws Exception {
        String summary = "This is a summary.";
        Path result = service.saveSummary(summary);
        assertTrue(result.toString().endsWith(".md"));
        assertTrue(java.nio.file.Files.exists(result));
        java.nio.file.Files.deleteIfExists(result);
    }
} 