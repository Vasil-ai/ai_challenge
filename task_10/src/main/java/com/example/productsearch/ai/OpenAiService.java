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
          \"description\": \"Extracts product filter criteria from user input. For price and rating, also extract the comparison type: 'min' (greater than or equal), 'max' (less than or equal), or 'equals'.\",
          \"parameters\": {
            \"type\": \"object\",
            \"properties\": {
              \"category\": {\"type\": \"string\", \"description\": \"Product category (e.g., Fitness, Electronics, etc.)\"},
              \"price\": {\"type\": \"number\", \"description\": \"Product price value\"},
              \"priceComparison\": {\"type\": \"string\", \"enum\": [\"min\", \"max\", \"equals\"], \"description\": \"Comparison type for price: 'min' means price >= value, 'max' means price <= value, 'equals' means price == value.\"},
              \"rating\": {\"type\": \"number\", \"description\": \"Product rating value\"},
              \"ratingComparison\": {\"type\": \"string\", \"enum\": [\"min\", \"max\", \"equals\"], \"description\": \"Comparison type for rating: 'min' means rating >= value, 'max' means rating <= value, 'equals' means rating == value.\"},
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
        userMsg.put("content", "Extract all relevant filter criteria from the following user input. For price and rating, also extract the comparison type: 'min' (greater than or equal), 'max' (less than or equal), or 'equals'. For example, 'above 4.5' means min, 'below 4.5' means max, 'exactly 4.5' means equals. User input: " + userInput);
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
                args.has("inStock") ? args.get("inStock").isNull() ? null : args.get("inStock").asBoolean() : null
        );
    }

    public List<Product> filterProductsWithOpenAI(List<Product> products, ProductFilter filter) throws IOException, InterruptedException {
        String functionSchema = """
        [{
          "type": "function",
          "name": "select_products",
          "description": "Given a list of products and a filter object, return ONLY the products that strictly match ALL filter criteria. For 'category', include only products whose category exactly matches the filter. For 'minRating', include only products with rating strictly greater than minRating. For 'maxPrice', include only products with price less than or equal to maxPrice. For 'inStock', include only products whose inStock value matches the filter. Do NOT include any products that do not match all specified filter fields. Example: If filter is {category: 'Fitness', minRating: 4.5}, only return products in the 'Fitness' category with rating > 4.5.",
          "parameters": {
            "type": "object",
            "properties": {
              "products": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "category": {"type": "string"}, "price": {"type": "number"}, "rating": {"type": "number"}, "inStock": {"type": "boolean"}}}},
              "filter": {"type": "object", "properties": {"category": {"type": "string"}, "maxPrice": {"type": "number"}, "minRating": {"type": "number"}, "inStock": {"type": "boolean"}}}
            },
            "required": ["products", "filter"]
          }
        }]
        """;
        ObjectNode request = mapper.createObjectNode();
        request.put("model", model);
        ArrayNode messages = mapper.createArrayNode();
        ObjectNode userMsg = mapper.createObjectNode();
        userMsg.put("role", "user");
        userMsg.put("content", "Given the list of products and the filter object, return ONLY the products that strictly match ALL filter criteria. For 'category', include only products whose category exactly matches the filter. For 'minRating', include only products with rating strictly greater than minRating. For 'maxPrice', include only products with price less than or equal to maxPrice. For 'inStock', include only products whose inStock value matches the filter. Do NOT include any products that do not match all specified filter fields. Example: If filter is {category: 'Fitness', minRating: 4.5}, only return products in the 'Fitness' category with rating > 4.5.");
        messages.add(userMsg);
        request.set("messages", messages);
        request.set("functions", mapper.readTree(functionSchema));
        request.put("function_call", "auto");
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
        //System.out.println("[DEBUG] Filtered: " + filtered.toString());
        return mapper.readValue(filtered.traverse(), new TypeReference<List<Product>>() {});
    }

    // For testability: allow injecting a mock response for extractFilterFromInput
    public ProductFilter extractFilterFromInputMock(String userInput, ProductFilter mockFilter) {
        return mockFilter;
    }
} 