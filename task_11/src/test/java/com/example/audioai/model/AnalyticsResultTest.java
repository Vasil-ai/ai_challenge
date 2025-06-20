package com.example.audioai.model;

import org.junit.jupiter.api.Test;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class AnalyticsResultTest {
    @Test
    void testAnalyticsResultGettersSetters() {
        TopicMention t1 = new TopicMention("AI", 5);
        TopicMention t2 = new TopicMention("Spring", 3);
        AnalyticsResult result = new AnalyticsResult(100, 120.5, List.of(t1, t2));
        assertEquals(100, result.getWordCount());
        assertEquals(120.5, result.getSpeakingSpeedWpm());
        assertEquals(2, result.getFrequentlyMentionedTopics().size());
        result.setWordCount(200);
        assertEquals(200, result.getWordCount());
    }

    @Test
    void testToPrettyJson() {
        TopicMention t1 = new TopicMention("AI", 5);
        AnalyticsResult result = new AnalyticsResult(10, 2.5, List.of(t1));
        String json = result.toPrettyJson();
        assertTrue(json.contains("AI"));
        assertTrue(json.contains("wordCount"));
    }

    @Test
    void testTopicMentionGettersSetters() {
        TopicMention t = new TopicMention();
        t.setTopic("Test");
        t.setMentions(7);
        assertEquals("Test", t.getTopic());
        assertEquals(7, t.getMentions());
    }
} 