package com.veyra.veyrabackend;

import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.json.JsonMapper;

/**
 * Creates one new story world (persona + scene) per day and stores it in the
 * writable data directory, so the bundled catalog never has to change.
 */
@Service
public class DailyStoryService {

    private static final Logger log =
            LoggerFactory.getLogger(DailyStoryService.class);

    private static final String[] SECTIONS = {
            "Romance", "Mystery", "Drama", "Thriller", "Late Night"
    };

    private final RestClient restClient;
    private final JsonMapper jsonMapper;
    private final StoryCatalog catalog;
    private final AvatarService avatarService;
    private final ZoneId zone;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.model}")
    private String model;

    public DailyStoryService(
            RestClient.Builder restClientBuilder,
            JsonMapper jsonMapper,
            StoryCatalog catalog,
            AvatarService avatarService,
            @Value("${veyra.daily.zone:Asia/Kolkata}") String zoneId
    ) {
        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofMinutes(2));

        this.restClient = restClientBuilder
                .requestFactory(requestFactory)
                .baseUrl("https://openrouter.ai/api/v1")
                .build();

        this.jsonMapper = jsonMapper;
        this.catalog = catalog;
        this.avatarService = avatarService;
        this.zone = ZoneId.of(zoneId);
    }

    /**
     * Generates, illustrates and stores one new story for today.
     *
     * @return the stored story
     */
    public synchronized Story generate() {
        return generateFor(LocalDate.now(zone));
    }

    /**
     * Generates a story for a specific date. Used when the app was offline at
     * 11 PM and has to catch up on days it missed.
     */
    public synchronized Story generateFor(LocalDate date) {

        if (date == null) {
            throw new IllegalArgumentException("A story date is required.");
        }

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException(
                    "OPENROUTER_API_KEY is not set, cannot generate a story."
            );
        }

        Story story = null;

        for (int attempt = 1; attempt <= 2 && story == null; attempt++) {

            Story candidate = parseStory(askForStory(attempt > 1));

            if (catalog.containsTitle(candidate.getTitle())) {
                log.warn(
                        "VEYRA: generated a duplicate title '{}', retrying.",
                        candidate.getTitle()
                );

                continue;
            }

            story = candidate;
        }

        if (story == null) {
            throw new IllegalStateException(
                    "Story generator kept returning duplicate titles."
            );
        }

        story.setId(catalog.nextId());
        story.setSection(pickSection());
        story.setStatus("Online");
        story.setFeaturedRank(null);
        story.setBackgroundClass(backgroundFor(story.getSection()));
        story.setCreatedOn(date.toString());
        story.setAvatar(avatarService.generate(story));

        catalog.saveGenerated(story);

        log.info(
                "VEYRA: daily story '{}' ({}) added to {}.",
                story.getTitle(),
                story.getId(),
                story.getSection()
        );

        return story;
    }

    private String askForStory(boolean strictAboutTitles) {

        String existingTitles = catalog.getAll()
                .stream()
                .map(Story::getTitle)
                .filter(title -> title != null && !title.isBlank())
                .limit(60)
                .collect(Collectors.joining("; "));

        String prompt = """
                You are the story editor of VEYRA, an Indian AI roleplay
                chat app. Create ONE new original story world with a single
                main character.

                RULES
                - Indian setting, present day, urban or small town.
                - The scene must already be in progress; the user walks into it.
                - Tone: romance, mystery, drama, thriller or late-night calm.
                - Keep it non-explicit: no sexual content, no gore, no violence.
                - The character must have a clear, distinct voice.
                - Write Hinglish for openingMessage and speechStyle.
                - Never reuse an existing title: %s
                %s

                Return ONLY a JSON object with exactly these fields:

                {
                  "title": "3 to 5 words",
                  "genres": ["Romance"],
                  "hook": "one line, at most 14 words",
                  "openingMessage": "first chat message in Hinglish",
                  "character": {
                    "name": "first name",
                    "age": 24,
                    "gender": "female or male",
                    "personality": "two sentences",
                    "backstory": "two sentences",
                    "speechStyle": "two sentences",
                    "boundaries": "one sentence"
                  },
                  "setting": "one or two sentences",
                  "scenario": "one sentence",
                  "openingBeat": "one sentence",
                  "look": "one sentence describing appearance and clothing for an image generator"
                }

                No markdown, no code fences, no commentary.
                """.formatted(
                existingTitles.isBlank() ? "(none)" : existingTitles,
                strictAboutTitles
                        ? "- Your previous attempt repeated a title. Pick a completely different idea."
                        : ""
        );

        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 900,
                "temperature", 0.95,
                // Avoid reasoning-only models that return no usable content.
                "reasoning", Map.of("effort", "none")
        );

        String responseBody = restClient
                .post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .body(body)
                .retrieve()
                .body(String.class);

        if (responseBody == null || responseBody.isBlank()) {
            throw new IllegalStateException(
                    "Story generator returned an empty response."
            );
        }

        return jsonMapper
                .readTree(responseBody)
                .path("choices")
                .path(0)
                .path("message")
                .path("content")
                .asText("");
    }

    Story parseStory(String raw) {

        String clean = raw == null ? "" : raw
                .replace("```json", "")
                .replace("```", "")
                .trim();

        int start = clean.indexOf('{');
        int end = clean.lastIndexOf('}');

        if (start >= 0 && end > start) {
            clean = clean.substring(start, end + 1);
        }

        Story story;

        try {
            story = jsonMapper.readValue(clean, Story.class);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Story generator returned invalid JSON.",
                    e
            );
        }

        if (story == null
                || isBlank(story.getTitle())
                || story.getCharacter() == null
                || isBlank(story.getCharacter().getName())
                || isBlank(story.getOpeningMessage())) {

            throw new IllegalStateException(
                    "Story generator returned an incomplete story."
            );
        }

        if (story.getGenres() == null || story.getGenres().isEmpty()) {
            story.setGenres(List.of("Drama"));
        }

        return story;
    }

    private String pickSection() {

        Map<String, Integer> counts = new LinkedHashMap<>();

        for (String section : SECTIONS) {
            counts.put(section, 0);
        }

        for (Story story : catalog.getAll()) {
            String section = story.getSection();

            if (section != null && counts.containsKey(section)) {
                counts.merge(section, 1, Integer::sum);
            }
        }

        return counts.entrySet()
                .stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Romance");
    }

    private String backgroundFor(String section) {

        return switch (section == null ? "" : section) {
            case "Romance" -> "bg-fake";
            case "Mystery" -> "bg-remembers";
            case "Drama" -> "bg-summer";
            case "Thriller" -> "bg-317";
            case "Late Night" -> "bg-317";
            default -> "bg-seat27";
        };
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
