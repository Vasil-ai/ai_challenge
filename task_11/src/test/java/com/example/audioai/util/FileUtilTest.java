package com.example.audioai.util;

import org.junit.jupiter.api.*;
import java.nio.file.*;
import static org.junit.jupiter.api.Assertions.*;

class FileUtilTest {
    private FileUtil fileUtil;
    private static final String TEST_OUTPUT = "test-output";

    @BeforeEach
    void setUp() {
        fileUtil = new FileUtil(TEST_OUTPUT);
    }

    @Test
    void testGenerateTimestampedFileName() {
        String fileName = fileUtil.generateTimestampedFileName("test", "txt");
        assertTrue(fileName.startsWith("test-") && fileName.endsWith(".txt"));
    }

    @Test
    void testSaveToFileString() throws Exception {
        String content = "Hello, world!";
        String fileName = fileUtil.generateTimestampedFileName("test", "txt");
        Path path = fileUtil.saveToFile(content, fileName);
        assertTrue(Files.exists(path));
        assertEquals(content, Files.readString(path));
        Files.deleteIfExists(path);
    }

    @Test
    void testSaveToFileBytes() throws Exception {
        byte[] content = "Hello, bytes!".getBytes();
        String fileName = fileUtil.generateTimestampedFileName("test", "bin");
        Path path = fileUtil.saveToFile(content, fileName);
        assertTrue(Files.exists(path));
        assertArrayEquals(content, Files.readAllBytes(path));
        Files.deleteIfExists(path);
    }
} 