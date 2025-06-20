# Audio AI Console App

A Java 21, Spring Boot 3.x console application for:
- Transcribing audio files using OpenAI Whisper API
- Summarizing transcripts using OpenAI GPT (gpt-4.1-mini)
- Extracting analytics: word count, speaking speed (WPM), and frequently mentioned topics
- Saving results to files in a configurable output directory

## Features
- Accepts any audio file (e.g., `.mp3`)
- Transcribes audio to Markdown
- Summarizes transcript to Markdown
- Extracts analytics to JSON
- All outputs saved in a configurable output folder
- Console output of analytics
- **Process multiple files in a row without restarting the app**
- **Type `exit` or `quit` at the prompt to stop the application**
- Unit tests with >60% code coverage

## Prerequisites
- Java 21+
- Maven 3.8+
- OpenAI API key (for Whisper and GPT)

## Configuration
Edit `src/main/resources/application.yml`:
```yaml
spring:
  ai:
    openai:
      api-key: YOUR_OPENAI_API_KEY
      base-url: https://api.openai.com/v1/
app:
  output-folder: output
```
- Set your OpenAI API key (or use the provided default if available)
- Change `output-folder` to set where result files are saved

## Build & Run
1. **Build the project:**
   ```sh
   mvn clean package
   ```
2. **Run the application:**
   ```sh
   java -jar target/audio-ai-0.0.1-SNAPSHOT.jar path/to/audio.mp3
   ```
   - Replace `path/to/audio.mp3` with your audio file path
   - Results will be saved in the output folder (default: `output/`)
   - After processing, you can enter another file path or type `exit`/`quit` to stop

## Example
**Console output:**
```
Using audio file: CAR0004.mp3
Starting transcription...
Transcription complete.
Starting summarization...
Summarization complete.
Starting analytics...
Raw GPT topic extraction response:
[
  {"topic": "chest pain", "mentions": 15},
  {"topic": "heart attack", "mentions": 6},
  {"topic": "symptoms", "mentions": 10}
]
Analytics complete.

Analytics:
{
  "wordCount" : 968,
  "speakingSpeedWpm" : 968.0,
  "frequentlyMentionedTopics" : [ {
    "topic" : "chest pain",
    "mentions" : 15
  }, ... ]
}

---

Enter the path to the audio file (or type 'exit' to quit):
```

**Output files:**
- `output/transcription-YYYYMMDD-HHMMSS.md`
- `output/summary-YYYYMMDD-HHMMSS.md`
- `output/analysis-YYYYMMDD-HHMMSS.json`

## Testing & Coverage
- Run all tests:
  ```sh
  mvn clean test
  ```
- View coverage report:
  Open `target/site/jacoco/index.html` in your browser.

## Notes
- All output and test files are ignored by `.gitignore`.
- For best results, use clear audio files in supported formats (e.g., mp3, wav).
- The app uses OpenAI Whisper for transcription and GPT-4.1-mini for summarization and analytics. 