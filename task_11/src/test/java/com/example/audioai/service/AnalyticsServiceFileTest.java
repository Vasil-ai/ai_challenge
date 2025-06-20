package com.example.audioai.service;

import com.example.audioai.model.AnalyticsResult;
import com.example.audioai.model.TopicMention;
import com.example.audioai.util.FileUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.nio.file.Path;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class AnalyticsServiceFileTest {
    private AnalyticsService service;
    private FileUtil fileUtil;

    @BeforeEach
    void setUp() {
        fileUtil = new FileUtil("test-output");
        service = new AnalyticsService(fileUtil);
    }

    @Test
    void testSaveAnalytics() throws Exception {
        AnalyticsResult analytics = new AnalyticsResult(10, 2.5, List.of(new TopicMention("AI", 5)));
        Path result = service.saveAnalytics(analytics);
        assertTrue(result.toString().endsWith(".json"));
        assertTrue(java.nio.file.Files.exists(result));
        java.nio.file.Files.deleteIfExists(result);
    }
} 