package com.example.productsearch.model;

public record ProductFilter(
    String category,
    Double price,
    String priceComparison, // "min", "max", "equals", or null
    Double rating,
    String ratingComparison, // "min", "max", "equals", or null
    Boolean inStock
) {
    // For testability
    public static ProductFilter of(String category, Double price, String priceComparison, Double rating, String ratingComparison, Boolean inStock) {
        return new ProductFilter(category, price, priceComparison, rating, ratingComparison, inStock);
    }
} 