package com.example.audioai.model;

public class TopicMention {
    private String topic;
    private int mentions;

    public TopicMention() {
        // no-arg constructor for Jackson
    }

    public TopicMention(String topic, int mentions) {
        this.topic = topic;
        this.mentions = mentions;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public int getMentions() {
        return mentions;
    }

    public void setMentions(int mentions) {
        this.mentions = mentions;
    }
} 