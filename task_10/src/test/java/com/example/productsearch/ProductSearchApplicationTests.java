package com.example.productsearch;

import com.example.productsearch.model.Product;
import com.example.productsearch.model.ProductFilter;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ProductSearchApplicationTests {
    private final List<Product> products = List.of(
            Product.of("A", "Fitness", 100, 4.5, true),
            Product.of("B", "Fitness", 200, 4.7, false),
            Product.of("C", "Electronics", 150, 4.8, true),
            Product.of("D", "Fitness", 120, 4.2, true)
    );

    @Test
    void testCategoryFilter() {
        var filter = ProductFilter.of("Fitness", null, null, null, null, null);
        var result = ProductSearchApplication.filterProductsStrict(products, filter);
        assertEquals(3, result.size());
        assertTrue(result.stream().allMatch(p -> p.category().equals("Fitness")));
    }

    @Test
    void testPriceMinFilter() {
        var filter = ProductFilter.of(null, 120.0, "min", null, null, null);
        var result = ProductSearchApplication.filterProductsStrict(products, filter);
        assertEquals(3, result.size());
        assertTrue(result.stream().allMatch(p -> p.price() >= 120));
    }

    @Test
    void testPriceMaxFilter() {
        var filter = ProductFilter.of(null, 120.0, "max", null, null, null);
        var result = ProductSearchApplication.filterProductsStrict(products, filter);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(p -> p.price() <= 120));
    }

    @Test
    void testPriceEqualsFilter() {
        var filter = ProductFilter.of(null, 100.0, "equals", null, null, null);
        var result = ProductSearchApplication.filterProductsStrict(products, filter);
        assertEquals(1, result.size());
        assertEquals("A", result.get(0).name());
    }

    @Test
    void testRatingMinFilter() {
        var filter = ProductFilter.of(null, null, null, 4.7, "min", null);
        var result = ProductSearchApplication.filterProductsStrict(products, filter);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(p -> p.rating() >= 4.7));
    }

    @Test
    void testRatingMaxFilter() {
        var filter = ProductFilter.of(null, null, null, 4.5, "max", null);
        var result = ProductSearchApplication.filterProductsStrict(products, filter);
        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(p -> p.rating() <= 4.5));
    }

    @Test
    void testRatingEqualsFilter() {
        var filter = ProductFilter.of(null, null, null, 4.2, "equals", null);
        var result = ProductSearchApplication.filterProductsStrict(products, filter);
        assertEquals(1, result.size());
        assertEquals("D", result.get(0).name());
    }

    @Test
    void testInStockFilter() {
        var filter = ProductFilter.of(null, null, null, null, null, true);
        var result = ProductSearchApplication.filterProductsStrict(products, filter);
        assertTrue(result.stream().allMatch(Product::inStock));
    }

    @Test
    void testCombinedFilters() {
        var filter = ProductFilter.of("Fitness", 120.0, "min", 4.5, "min", true);
        var result = ProductSearchApplication.filterProductsStrict(products, filter);
        assertEquals(0, result.size());
    }
} 