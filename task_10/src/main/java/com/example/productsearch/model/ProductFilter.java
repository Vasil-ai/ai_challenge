package com.example.productsearch.model;

public record ProductFilter(
    String category,
    Double maxPrice,
    Double minRating,
    Boolean inStock
) {} 