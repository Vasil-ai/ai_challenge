# Product Search AI Console Application

This is a Java 21, Spring Boot 3.x console application that uses OpenAI's function calling to filter products from a dataset based on natural language user preferences. The application demonstrates AI-powered reasoning over a local JSON dataset, with all filtering logic performed by OpenAI.

---

## Features

- Accepts user product search queries in natural language (e.g., "Show me fitness products under $200 and in stock").
- Uses OpenAI's function calling to:
  - Convert user input into structured filter criteria.
  - Select/filter products from a local `products.json` dataset (no manual filtering in Java code).
- Returns a user-friendly, structured list of matching products.
- Supports repeated queries in a single session; type `exit` or press `Ctrl+C` to quit.

---

## Prerequisites

- **Java 21** or later installed.
- **Maven** installed.
- An **OpenAI API key** with access to the desired model (e.g., `gpt-4.1-mini` or `gpt-4o`).

---

## Setup

1. **Clone the repository** (or copy the project files to your machine).

2. **Configure your OpenAI API key and model:**

   Edit `src/main/resources/application.properties`:
   ```properties
   openai.api.key=YOUR_OPENAI_API_KEY
   openai.model=gpt-4.1-mini
   openai.api.url=https://api.openai.com/v1/chat/completions
   ```

   - Replace `YOUR_OPENAI_API_KEY` with your actual OpenAI API key.
   - You can change the model or API URL as needed.

3. **Ensure your dataset is present:**

   The file `src/main/resources/products.json` should contain your product data.  
   (A sample is already provided.)

---

## Build

From the project root, run:

```sh
mvn clean package
```

This will produce an executable JAR in the `target/` directory.

---

## Run

From the project root, run:

```sh
java -jar target/productsearchai-1.0.0.jar
```

You will see:

```
Enter your product search preferences (or type 'exit' to quit):
```

Type your query (e.g., `Show me fitness products under $200 and in stock`) and press Enter.  
You can enter as many queries as you like. Type `exit` or press `Ctrl+C` to quit.

---

## Example Session

### Query 1
**Input:**
```
Show me fitness products with rating above 4.6  
```
**Output:**
```
Filtered Products:
1. Yoga Mat - $20.00, Category: Fitness, Rating: 4.8, In Stock
2. Running Shoes - $60.00, Category: Fitness, Rating: 4.7, In Stock
```

---

### Query 2
**Input:**
```
Show me kitchen products with price under $100 
```
**Output:**
```
Filtered Products:
1. Blender Pro - $89.99, Category: Kitchen, Rating: 4.4, In Stock
```

---

### Exit
**Input:**
```
exit
```
**Output:**
```
Exiting product search. Goodbye!
```

---

## Configuration

All configuration is in `src/main/resources/application.properties`:

- `openai.api.key` — Your OpenAI API key.
- `openai.model` — The OpenAI model to use (e.g., `gpt-4.1-mini`).
- `openai.api.url` — The OpenAI API endpoint.

---

## Notes

- All product filtering is performed by OpenAI via function calling. No manual filtering logic is present in the Java code.
- The application will print a friendly goodbye message if you exit with `exit`, `quit`, or `Ctrl+C`.
- The `target/` directory and IDE files are excluded from version control via `.gitignore`.

---

## Troubleshooting

- **No products returned?**  
  Check your query wording and ensure your API key and model are correct.
- **API errors?**  
  Ensure your OpenAI API key is valid and has access to the specified model.
- **Java errors?**  
  Make sure you are using Java 21 or later.

---

## License

This project is for demonstration and educational purposes.

## Running Unit Tests and Checking Coverage

To run all unit tests and generate a code coverage report (using JaCoCo):

```
mvn clean test
```

To view the coverage report, open the generated HTML file at:
```
target/site/jacoco/index.html
```

Ensure your coverage is above 60% for acceptance. 