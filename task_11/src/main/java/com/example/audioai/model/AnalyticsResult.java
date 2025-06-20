package com.example.audioai.model;

import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

public class AnalyticsResult {
    private int wordCount;
    private double speakingSpeedWpm;
    private List<TopicMention> frequentlyMentionedTopics;

    public AnalyticsResult(int wordCount, double speakingSpeedWpm, List<TopicMention> frequentlyMentionedTopics) {
        this.wordCount = wordCount;
        this.speakingSpeedWpm = speakingSpeedWpm;
        this.frequentlyMentionedTopics = frequentlyMentionedTopics;
    }

    public int getWordCount() {
        return wordCount;
    }

    public void setWordCount(int wordCount) {
        this.wordCount = wordCount;
    }

    public double getSpeakingSpeedWpm() {
        return speakingSpeedWpm;
    }

    public void setSpeakingSpeedWpm(double speakingSpeedWpm) {
        this.speakingSpeedWpm = speakingSpeedWpm;
    }

    public List<TopicMention> getFrequentlyMentionedTopics() {
        return frequentlyMentionedTopics;
    }

    public void setFrequentlyMentionedTopics(List<TopicMention> frequentlyMentionedTopics) {
        this.frequentlyMentionedTopics = frequentlyMentionedTopics;
    }

    public String toPrettyJson() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            return mapper.writeValueAsString(this);
        } catch (Exception e) {
            return "{\"error\":\"Failed to serialize analytics result\"}";
        }
    }
} 