package com.example.productsearch.ai;

import com.example.productsearch.model.Product;
import com.example.productsearch.model.ProductFilter;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

public class OpenAiService {
    private final String openAiApiKey;
    private final String model;
    private final String apiUrl;
    private final ObjectMapper mapper = new ObjectMapper();
    private final HttpClient client = HttpClient.newHttpClient();

    public OpenAiService(String openAiApiKey, String model, String apiUrl) {
      this.openAiApiKey = openAiApiKey;
      this.model = model;
      this.apiUrl = apiUrl;
    }

    public ProductFilter extractFilterFromInput(String userInput) throws IOException, InterruptedException {
        String functionSchema = """
        [{
          \"type\": \"function\",
          \"name\": \"filter_products\",
          \"description\": \"Extracts product filter criteria from user input. For price and rating, also extract the comparison type: 'min' (greater than or equal), 'max' (less than or equal), or 'equals'. Also extract sort and limit information if the user requests the most/least expensive or highest/lowest rated products.\",
          \"parameters\": {
            \"type\": \"object\",
            \"properties\": {
              \"category\": {\"type\": \"string\", \"description\": \"Product category (e.g., Fitness, Electronics, etc.)\"},
              \"price\": {\"type\": \"number\", \"description\": \"Product price value\"},
              \"priceComparison\": {\"type\": \"string\", \"enum\": [\"min\", \"max\", \"equals\"], \"description\": \"Comparison type for price: 'min' means price >= value, 'max' means price <= value, 'equals' means price == value.\"},
              \"rating\": {\"type\": \"number\", \"description\": \"Product rating value\"},
              \"ratingComparison\": {\"type\": \"string\", \"enum\": [\"min\", \"max\", \"equals\"], \"description\": \"Comparison type for rating: 'min' means rating >= value, 'max' means rating <= value, 'equals' means rating == value.\"},
              \"inStock\": {\"type\": \"boolean\", \"description\": \"In stock only\"},
              \"sortBy\": {\"type\": \"string\", \"enum\": [\"price\", \"rating\"], \"description\": \"Sort field: price or rating.\"},
              \"sortOrder\": {\"type\": \"string\", \"enum\": [\"asc\", \"desc\"], \"description\": \"Sort order: asc for ascending, desc for descending.\"},
              \"limit\": {\"type\": \"integer\", \"description\": \"Limit the number of results (e.g., 1 for most expensive/cheapest/highest rated).\"}
            }
          }
        }]
        """;
        ObjectNode request = mapper.createObjectNode();
        request.put("model", model);
        ArrayNode messages = mapper.createArrayNode();
        ObjectNode userMsg = mapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", "Extract all relevant filter criteria from the following user input. For price and rating, also extract the comparison type: 'min' (greater than or equal), 'max' (less than or equal), or 'equals'. If the user requests the most/least expensive or highest/lowest rated products, extract sortBy (price or rating), sortOrder (asc or desc), and limit (e.g., 1 for most/least). If the user requests a category, match it case-insensitively to the available categories in the dataset (e.g., 'book' should match 'Books'). Example categories: Books, Electronics, Fitness, Kitchen, Clothing. For example, if the user says 'Provide the most expensive book', set category to 'Books', sortBy to 'price', sortOrder to 'desc', and limit to 1. User input: " + userInput);
        messages.add(userMsg);
        request.set("messages", messages);
        request.set("functions", mapper.readTree(functionSchema));
        request.put("function_call", "auto");

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Authorization", "Bearer " + openAiApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(request)))
                .build();
        HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode root = mapper.readTree(response.body());
        JsonNode args = root.at("/choices/0/message/function_call/arguments");
        if (args.isTextual()) args = mapper.readTree(args.asText());
        return new ProductFilter(
                args.path("category").asText(null),
                args.has("price") ? args.get("price").isNull() ? null : args.get("price").asDouble() : null,
                args.has("priceComparison") ? args.get("priceComparison").isNull() ? null : args.get("priceComparison").asText(null) : null,
                args.has("rating") ? args.get("rating").isNull() ? null : args.get("rating").asDouble() : null,
                args.has("ratingComparison") ? args.get("ratingComparison").isNull() ? null : args.get("ratingComparison").asText(null) : null,
                args.has("inStock") ? args.get("inStock").isNull() ? null : args.get("inStock").asBoolean() : null,
                args.has("sortBy") ? args.get("sortBy").isNull() ? null : args.get("sortBy").asText(null) : null,
                args.has("sortOrder") ? args.get("sortOrder").isNull() ? null : args.get("sortOrder").asText(null) : null,
                args.has("limit") ? args.get("limit").isNull() ? null : args.get("limit").asInt() : null
        );
    }

    public List<Product> filterProductsWithOpenAI(List<Product> products, ProductFilter filter) throws IOException, InterruptedException {
        // Debug: print all unique categories in the product list
        java.util.Set<String> uniqueCategories = new java.util.HashSet<>();
        for (Product p : products) {
            uniqueCategories.add(p.category());
        }
        System.out.println("[DEBUG] Unique categories in products: " + uniqueCategories);
        if (filter.category() != null) {
            System.out.println("[DEBUG] Category to normalize: '" + filter.category() + "'");
        }
        // Normalize category in filter to match dataset (case-insensitive)
        String normalizedCategory = null;
        if (filter.category() != null) {
            for (Product p : products) {
                if (p.category().equalsIgnoreCase(filter.category())) {
                    normalizedCategory = p.category(); // Use exact case from data
                    break;
                }
            }
        }
        ProductFilter normalizedFilter = filter;
        if (normalizedCategory != null) {
            normalizedFilter = new ProductFilter(
                normalizedCategory,
                filter.price(),
                filter.priceComparison(),
                filter.rating(),
                filter.ratingComparison(),
                filter.inStock(),
                filter.sortBy(),
                filter.sortOrder(),
                filter.limit()
            );
        }
        // Print the normalized filter to confirm
        System.out.println("[DEBUG] Normalized filter to AI: " + normalizedFilter);
        // Debug print: products and normalized filter sent to AI
        System.out.println("[DEBUG] Sending products to AI: " + products);
        String functionSchema = """
        [{
          \"type\": \"function\",
          \"name\": \"select_products\",
          \"description\": \"Given a list of products and a filter object, return ONLY the products that strictly match ALL filter criteria. First, filter by category (case-insensitive, e.g., 'Books' and 'books' are considered equal). Do NOT include any product whose category does not match the filter, even if it matches other fields. Then, apply all other filters (minRating, maxPrice, inStock, etc.). If sortBy and sortOrder are provided, sort the results accordingly. If limit is provided, return only up to that many products. Do NOT include any products that do not match all specified filter fields. Example: If filter is {category: 'Books', sortBy: 'price', sortOrder: 'desc', limit: 1}, only return the single most expensive product in the 'Books' category (case-insensitive). Here are some example categories from the data: Books, Electronics, Fitness, Kitchen, Clothing. Negative example: If filter is {category: 'Books'}, do NOT include any product with category other than 'Books', even if it matches other fields.\",
          \"parameters\": {
            \"type\": \"object\",
            \"properties\": {
              \"products\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}, \"category\": {\"type\": \"string\"}, \"price\": {\"type\": \"number\"}, \"rating\": {\"type\": \"number\"}, \"inStock\": {\"type\": \"boolean\"}}}},
              \"filter\": {\"type\": \"object\", \"properties\": {\"category\": {\"type\": \"string\"}, \"maxPrice\": {\"type\": \"number\"}, \"minRating\": {\"type\": \"number\"}, \"inStock\": {\"type\": \"boolean\"}, \"sortBy\": {\"type\": \"string\"}, \"sortOrder\": {\"type\": \"string\"}, \"limit\": {\"type\": \"integer\"}}}
            },
            \"required\": [\"products\", \"filter\"]
          }
        }]
        """;
        ObjectNode request = mapper.createObjectNode();
        request.put("model", model);
        ArrayNode messages = mapper.createArrayNode();
        ObjectNode userMsg = mapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", "Given the list of products and the filter object, return ONLY the products that strictly match ALL filter criteria. First, filter by category (case-insensitive, e.g., 'Books' and 'books' are considered equal). Do NOT include any product whose category does not match the filter, even if it matches other fields. Then, apply all other filters (minRating, maxPrice, inStock, etc.). If sortBy and sortOrder are provided, sort the results accordingly. If limit is provided, return only up to that many products. Do NOT include any products that do not match all specified filter fields. Example: If filter is {category: 'Books', sortBy: 'price', sortOrder: 'desc', limit: 1}, only return the single most expensive product in the 'Books' category (case-insensitive). Here are some example categories from the data: Books, Electronics, Fitness, Kitchen, Clothing. Negative example: If filter is {category: 'Books'}, do NOT include any product with category other than 'Books', even if it matches other fields.");
        messages.add(userMsg);
        request.set("messages", messages);
        request.set("functions", mapper.readTree(functionSchema));
        request.put("function_call", "auto");
        ObjectNode args = mapper.createObjectNode();
        args.set("products", mapper.valueToTree(products));
        args.set("filter", mapper.valueToTree(normalizedFilter));
        ObjectNode functionCall = mapper.createObjectNode();
        functionCall.put("name", "select_products");
        functionCall.set("arguments", args);
        request.set("function_call", functionCall);

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(apiUrl))
                .header("Authorization", "Bearer " + openAiApiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(request)))
                .build();
        HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode root = mapper.readTree(response.body());
        JsonNode functionArgs = root.at("/choices/0/message/function_call/arguments");
        if (functionArgs.isTextual()) functionArgs = mapper.readTree(functionArgs.asText());
        JsonNode filtered = functionArgs.path("products");
        System.out.println("[DEBUG] Filtered: " + filtered.toString());
        return mapper.readValue(filtered.traverse(), new TypeReference<List<Product>>() {});
    }

    // For testability: allow injecting a mock response for extractFilterFromInput
    public ProductFilter extractFilterFromInputMock(String userInput, ProductFilter mockFilter) {
        return mockFilter;
    }
} 