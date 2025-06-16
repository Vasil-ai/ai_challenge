package com.example.serviceanalyzer;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.ai.openai.OpenAiChatClient;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;
import java.util.Scanner;
import org.springframework.ai.openai.OpenAiChatOptions;

@SpringBootApplication
public class ServiceAnalyzerApplication {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.model}")
    private String model;

    public static void main(String[] args) {
        // Check for API key
        String apiKey = System.getenv("OPENAI_API_KEY");
        if (apiKey == null || apiKey.trim().isEmpty()) {
            System.err.println("Error: OPENAI_API_KEY environment variable is not set!");
            System.err.println("Please set your OpenAI API key using:");
            System.err.println("Windows PowerShell: $env:OPENAI_API_KEY=\"your-api-key-here\"");
            System.err.println("Windows Command Prompt: set OPENAI_API_KEY=your-api-key-here");
            System.exit(1);
        }

        new SpringApplicationBuilder(ServiceAnalyzerApplication.class)
            .web(org.springframework.boot.WebApplicationType.NONE)
            .run(args);
    }

    @Bean
    public OpenAiChatClient openAiChatClient() {
        OpenAiApi openAiApi = new OpenAiApi(apiKey);
        OpenAiChatOptions options = OpenAiChatOptions.builder()
                .withModel(model)
                .build();
        return new OpenAiChatClient(openAiApi, options);
    }

    @Bean
    public CommandLineRunner commandLineRunner(OpenAiChatClient aiClient) {
        return args -> {
            Scanner scanner = new Scanner(System.in);
            System.out.println("Enter service name or description (type 'exit' to quit):");
            
            while (true) {
                String input = scanner.nextLine().trim();
                if ("exit".equalsIgnoreCase(input)) {
                    break;
                }
                
                String promptTemplate = """
                    Analyze the following service/product: {input}
                    
                    Generate a detailed markdown report including:
                    
                    ## Brief History
                    - Founding year
                    - Key milestones
                    
                    ## Target Audience
                    - Primary user segments
                    
                    ## Core Features
                    - Top 2-4 key functionalities
                    
                    ## Unique Selling Points
                    - Key differentiators
                    
                    ## Business Model
                    - Revenue streams
                    - Pricing strategy
                    
                    ## Tech Stack Insights
                    - Known technologies used
                    
                    ## Perceived Strengths
                    - Notable advantages
                    
                    ## Perceived Weaknesses
                    - Known limitations
                    
                    Format the response in clean markdown with proper headers and bullet points.
                    """;
                
                PromptTemplate template = new PromptTemplate(promptTemplate);
                Prompt prompt = template.create(Map.of("input", input));
                
                String response = aiClient.call(prompt).getResult().getOutput().getContent();
                System.out.println("\nAnalysis Report:\n");
                System.out.println(response);
                System.out.println("\nEnter another service or 'exit' to quit:");
            }
            
            scanner.close();
        };
    }
} 