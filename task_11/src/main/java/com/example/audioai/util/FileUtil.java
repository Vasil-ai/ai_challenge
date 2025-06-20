package com.example.audioai.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class FileUtil {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss");
    private final String outputFolder;

    public FileUtil(@Value("${app.output-folder:output}") String outputFolder) {
        this.outputFolder = outputFolder;
    }

    public String generateTimestampedFileName(String prefix, String extension) {
        String timestamp = LocalDateTime.now().format(FORMATTER);
        return prefix + "-" + timestamp + "." + extension;
    }

    public Path saveToFile(String content, String fileName) {
        try {
            Path outputDir = Path.of(outputFolder);
            if (!Files.exists(outputDir)) {
                Files.createDirectories(outputDir);
            }
            Path path = outputDir.resolve(fileName);
            Files.writeString(path, content);
            return path;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + fileName, e);
        }
    }

    public Path saveToFile(byte[] content, String fileName) {
        try {
            Path outputDir = Path.of(outputFolder);
            if (!Files.exists(outputDir)) {
                Files.createDirectories(outputDir);
            }
            Path path = outputDir.resolve(fileName);
            Files.write(path, content);
            return path;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file: " + fileName, e);
        }
    }
} 