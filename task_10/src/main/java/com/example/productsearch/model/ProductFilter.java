package com.example.productsearch.model;

public record ProductFilter(
    String category,
    Double price,
    String priceComparison, // "min", "max", "equals", or null
    Double rating,
    String ratingComparison, // "min", "max", "equals", or null
    Boolean inStock,
    String sortBy, // "price" or "rating"
    String sortOrder, // "asc" or "desc"
    Integer limit // e.g., 1 for most expensive/cheapest/highest rated
) {
    // For testability
    public static ProductFilter of(String category, Double price, String priceComparison, Double rating, String ratingComparison, Boolean inStock, String sortBy, String sortOrder, Integer limit) {
        return new ProductFilter(category, price, priceComparison, rating, ratingComparison, inStock, sortBy, sortOrder, limit);
    }
} 