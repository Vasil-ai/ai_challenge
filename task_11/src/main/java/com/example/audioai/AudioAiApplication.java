package com.example.audioai;

import com.example.audioai.service.AudioTranscriptionService;
import com.example.audioai.service.GptSummarizationService;
import com.example.audioai.service.AnalyticsService;
import com.example.audioai.model.AnalyticsResult;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.file.Path;
import java.util.Scanner;

@SpringBootApplication
public class AudioAiApplication implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(AudioAiApplication.class);

    private final AudioTranscriptionService transcriptionService;
    private final GptSummarizationService summarizationService;
    private final AnalyticsService analyticsService;

    @Autowired
    public AudioAiApplication(AudioTranscriptionService transcriptionService,
                              GptSummarizationService summarizationService,
                              AnalyticsService analyticsService) {
        this.transcriptionService = transcriptionService;
        this.summarizationService = summarizationService;
        this.analyticsService = analyticsService;
    }

    public static void main(String[] args) {
        SpringApplication.run(AudioAiApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        while (true) {
            Path audioPath;
            if (args.length > 0 && args[0] != null && !args[0].isBlank()) {
                audioPath = Path.of(args[0]);
                System.out.println("Using audio file: " + audioPath);
                args = new String[0]; // Only use the argument for the first run
            } else {
                System.out.print("Enter the path to the audio file (or type 'exit' to quit): ");
                String audioFilePath = scanner.nextLine();
                if (audioFilePath.equalsIgnoreCase("exit") || audioFilePath.equalsIgnoreCase("quit")) {
                    System.out.println("Exiting application.");
                    break;
                }
                audioPath = Path.of(audioFilePath);
            }

            try {
                System.out.println("Starting transcription...");
                String transcription = transcriptionService.transcribeAudio(audioPath);
                System.out.println("Transcription complete.");
                Path transcriptionFile = transcriptionService.saveTranscription(transcription);
                logger.info("Transcription saved to: {}", transcriptionFile);

                System.out.println("Starting summarization...");
                String summary = summarizationService.summarize(transcription);
                System.out.println("Summarization complete.");
                Path summaryFile = summarizationService.saveSummary(summary);
                logger.info("Summary saved to: {}", summaryFile);

                System.out.println("Starting analytics...");
                AnalyticsResult analytics = analyticsService.analyze(transcription, audioPath);
                System.out.println("Analytics complete.");
                Path analyticsFile = analyticsService.saveAnalytics(analytics);
                logger.info("Analytics saved to: {}", analyticsFile);

                // 4. Print analytics to console
                System.out.println("\nAnalytics:");
                System.out.println(analytics.toPrettyJson());
            } catch (Exception e) {
                e.printStackTrace();
            }
            System.out.println("\n---\n");
        }
    }
} 