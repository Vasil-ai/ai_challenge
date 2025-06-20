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
        String model = env.getProperty("openai.model", "gpt-4.1-mini");//"gpt-4o");
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
                // System.out.println("[DEBUG] Extracted filter: " + filter);
                List<Product> aiFiltered = aiService.filterProductsWithOpenAI(products, filter);
                List<Product> filtered = filterProductsStrict(aiFiltered, filter);
                System.out.println("Filtered Products:");
                if (filtered.isEmpty()) {
                    System.out.println("No products found matching your criteria.");
                } else {
                    int i = 1;
                    for (Product p : filtered) {
                        System.out.printf("%d. %s - $%.2f, Category: %s, Rating: %.1f, %s\n",
                                i++, p.name(), p.price(), p.category(), p.rating(), p.inStock() ? "In Stock" : "Out of Stock");
                    }
                }
            } catch (Exception e) {
                System.out.println("An error occurred while processing your request: " + e.getMessage());
            }
        }
    }

    // @VisibleForTesting
    public static List<Product> filterProductsStrict(List<Product> products, ProductFilter filter) {
        return products.stream()
            .filter(p -> filter.category() == null || p.category().equalsIgnoreCase(filter.category()))
            .filter(p -> {
                if (filter.price() == null || filter.priceComparison() == null) return true;
                return switch (filter.priceComparison()) {
                    case "min" -> p.price() >= filter.price();
                    case "max" -> p.price() <= filter.price();
                    case "equals" -> p.price() == filter.price();
                    default -> true;
                };
            })
            .filter(p -> {
                if (filter.rating() == null || filter.ratingComparison() == null) return true;
                return switch (filter.ratingComparison()) {
                    case "min" -> p.rating() >= filter.rating();
                    case "max" -> p.rating() <= filter.rating();
                    case "equals" -> p.rating() == filter.rating();
                    default -> true;
                };
            })
            .filter(p -> filter.inStock() == null || p.inStock() == filter.inStock())
            .toList();
    }
} 