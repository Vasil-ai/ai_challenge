package com.example.productsearch;

import com.example.productsearch.ai.OpenAiService;
import com.example.productsearch.model.Product;
import com.example.productsearch.model.ProductFilter;
import com.example.productsearch.util.JsonUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.util.List;
import java.util.Scanner;

@SpringBootApplication
public class ProductSearchApplication implements CommandLineRunner {
    @Autowired
    private Environment env;

    public static void main(String[] args) {
        SpringApplication.run(ProductSearchApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("\nExiting product search. Goodbye!");
        }));
        Scanner scanner = new Scanner(System.in);
        String apiKey = env.getProperty("openai.api.key");
        String model = env.getProperty("openai.model", "gpt-4o");
        String apiUrl = env.getProperty("openai.api.url", "https://api.openai.com/v1/chat/completions");
        List<Product> products = JsonUtil.loadProducts("products.json");
        OpenAiService aiService = new OpenAiService(apiKey, model, apiUrl);
        while (true) {
            System.out.println("Enter your product search preferences (or type 'exit' to quit):");
            String userInput = scanner.nextLine();
            if (userInput == null || userInput.trim().equalsIgnoreCase("exit") || userInput.trim().equalsIgnoreCase("quit")) {
                System.out.println("Exiting product search. Goodbye!");
                break;
            }
            try {
                ProductFilter filter = aiService.extractFilterFromInput(userInput);
                List<Product> filtered = aiService.filterProductsWithOpenAI(products, filter);
                System.out.println("Filtered Products:");
                if (filtered.isEmpty()) {
                    System.out.println("No products found matching your criteria.");
                } else {
                    int i = 1;
                    for (Product p : filtered) {
                        System.out.printf("%d. %s - $%.2f, Rating: %.1f, %s\n",
                                i++, p.name(), p.price(), p.rating(), p.inStock() ? "In Stock" : "Out of Stock");
                    }
                }
            } catch (Exception e) {
                System.out.println("An error occurred while processing your request: " + e.getMessage());
            }
        }
    }
} 