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
          \"name\": \"filter_products\",
          \"description\": \"Extracts product filter criteria from user input\",
          \"parameters\": {
            \"type\": \"object\",
            \"properties\": {
              \"category\": {\"type\": \"string\", \"description\": \"Product category\"},
              \"maxPrice\": {\"type\": \"number\", \"description\": \"Maximum price\"},
              \"minRating\": {\"type\": \"number\", \"description\": \"Minimum rating\"},
              \"inStock\": {\"type\": \"boolean\", \"description\": \"In stock only\"}
            }
          }
        }]
        """;
        ObjectNode request = mapper.createObjectNode();
        request.put("model", model);
        ArrayNode messages = mapper.createArrayNode();
        ObjectNode userMsg = mapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", userInput);
        messages.add(userMsg);
        request.set("messages", messages);
        request.set("functions", mapper.readTree(functionSchema));
        request.put("function_call", "filter_products");

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
                args.has("maxPrice") ? args.get("maxPrice").isNull() ? null : args.get("maxPrice").asDouble() : null,
                args.has("minRating") ? args.get("minRating").isNull() ? null : args.get("minRating").asDouble() : null,
                args.has("inStock") ? args.get("inStock").isNull() ? null : args.get("inStock").asBoolean() : null
        );
    }

    public List<Product> filterProductsWithOpenAI(List<Product> products, ProductFilter filter) throws IOException, InterruptedException {
        String functionSchema = """
        [{
          \"name\": \"select_products\",
          \"description\": \"Selects products from a list based on filter criteria\",
          \"parameters\": {
            \"type\": \"object\",
            \"properties\": {
              \"products\": {\"type\": \"array\", \"items\": {\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}, \"category\": {\"type\": \"string\"}, \"price\": {\"type\": \"number\"}, \"rating\": {\"type\": \"number\"}, \"inStock\": {\"type\": \"boolean\"}}}},
              \"filter\": {\"type\": \"object\", \"properties\": {\"category\": {\"type\": \"string\"}, \"maxPrice\": {\"type\": \"number\"}, \"minRating\": {\"type\": \"number\"}, \"inStock\": {\"type\": \"boolean\"}}}
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
        userMsg.put("content", "Select products from the list that match the filter criteria.");
        messages.add(userMsg);
        request.set("messages", messages);
        request.set("functions", mapper.readTree(functionSchema));
        request.put("function_call", "select_products");
        ObjectNode args = mapper.createObjectNode();
        args.set("products", mapper.valueToTree(products));
        args.set("filter", mapper.valueToTree(filter));
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
        return mapper.readValue(filtered.traverse(), new TypeReference<List<Product>>() {});
    }
} 