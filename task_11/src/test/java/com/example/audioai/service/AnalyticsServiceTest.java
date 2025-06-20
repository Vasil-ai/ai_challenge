package com.example.audioai.service;

import com.example.audioai.model.AnalyticsResult;
import com.example.audioai.model.TopicMention;
import com.example.audioai.util.FileUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.nio.file.Path;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class AnalyticsServiceTest {
    private AnalyticsService analyticsService;
    private FileUtil fileUtil;

    @BeforeEach
    void setUp() {
        fileUtil = new FileUtil("test-output");
        analyticsService = new AnalyticsService(fileUtil);
    }

    @Test
    void testAnalyzeWordCountAndWpm() {
        String transcript = "hello world hello";
        Path dummyPath = Path.of("dummy.mp3");
        AnalyticsResult result = analyticsService.analyze(transcript, dummyPath);
        assertEquals(3, result.getWordCount());
        assertTrue(result.getSpeakingSpeedWpm() > 0);
    }

    @Test
    void testParseTopicsJson() {
        String json = "[{\"topic\":\"AI\",\"mentions\":5},{\"topic\":\"Spring\",\"mentions\":3}]";
        List<TopicMention> topics = analyticsService.parseTopicsJson(json);
        assertEquals(2, topics.size());
        assertEquals("AI", topics.get(0).getTopic());
        assertEquals(5, topics.get(0).getMentions());
    }
} 