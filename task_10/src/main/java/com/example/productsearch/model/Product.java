package com.example.productsearch.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;

public record Product(
    String name,
    String category,
    double price,
    double rating,
    @JsonProperty("in_stock") @JsonAlias("inStock") boolean inStock
) {} 