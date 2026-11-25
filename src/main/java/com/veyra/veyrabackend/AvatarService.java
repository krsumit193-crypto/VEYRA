package com.veyra.veyrabackend;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/**
 * Creates the portrait for a persona.
 *
 * Tries the OpenRouter image model first. If that is unavailable (no key,
 * rate limit, model without image output) it falls back to a local SVG
 * placeholder so every story always has a usable picture.
 */
@Service
public class AvatarService {

    private static final Logger log =
            LoggerFactory.getLogger(AvatarService.class);

    private final RestClient restClient;
    private final JsonMapper jsonMapper;
    private final Path imagesDir;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.image.model}")
    private String imageModel;

    public AvatarService(
            RestClient.Builder restClientBuilder,
            JsonMapper jsonMapper,
            @Value("${veyra.data.dir:data}") String dataDir
    ) {
        SimpleClientHttpRequestFactory requestFactory =
                new SimpleClientHttpRequestFactory();

        requestFactory.setConnectTimeout(Duration.ofSeconds(10));
        requestFactory.setReadTimeout(Duration.ofMinutes(3));

        this.restClient = restClientBuilder
                .requestFactory(requestFactory)
                .baseUrl("https://openrouter.ai/api/v1")
                .build();

        this.jsonMapper = jsonMapper;
        this.imagesDir = Path.of(dataDir, "images");
    }

    /**
     * @return a web path such as {@code /generated-images/story19.png}
     */
    public String generate(Story story) {

        String storyId = story.getId();

        try {
            ImagePayload payload = requestImage(story);

            Files.createDirectories(imagesDir);
            deleteOldPortraits(storyId);

            Path file = imagesDir.resolve(
                    storyId + "." + payload.extension()
            );

            Files.write(file, payload.bytes());

            log.info(
                    "VEYRA: avatar generated for {} -> {}",
                    storyId,
                    file.getFileName()
            );

            return "/generated-images/" + file.getFileName();

        } catch (Exception e) {

            log.warn(
                    "VEYRA: image generation failed for {} ({}). Using a placeholder.",
                    storyId,
                    e.getMessage()
            );

            return writePlaceholder(story);
        }
    }

    private ImagePayload requestImage(Story story) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("OPENROUTER_API_KEY is not set");
        }

        Map<String, Object> body = Map.of(
                "model", imageModel,
                "modalities", List.of("image", "text"),
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", buildPrompt(story)
                        )
                )
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
            throw new IllegalStateException("Image model returned nothing");
        }

        JsonNode message = jsonMapper
                .readTree(responseBody)
                .path("choices")
                .path(0)
                .path("message");

        String dataUrl = firstImageUrl(message);

        if (dataUrl == null || dataUrl.isBlank()) {
            throw new IllegalStateException(
                    "Image model returned no image data"
            );
        }

        return decode(dataUrl);
    }

    private String firstImageUrl(JsonNode message) {

        JsonNode images = message.path("images");

        if (images.isArray() && !images.isEmpty()) {
            JsonNode first = images.path(0);

            String url = first.path("image_url").path("url").asText("");

            if (!url.isBlank()) {
                return url;
            }

            return first.path("url").asText("");
        }

        return "";
    }

    private ImagePayload decode(String dataUrl) {

        int comma = dataUrl.indexOf(',');

        if (!dataUrl.startsWith("data:") || comma < 0) {
            throw new IllegalStateException("Unexpected image payload");
        }

        String header = dataUrl.substring(0, comma);
        String base64 = dataUrl.substring(comma + 1);

        String extension = "png";

        if (header.contains("jpeg") || header.contains("jpg")) {
            extension = "jpg";
        } else if (header.contains("webp")) {
            extension = "webp";
        }

        byte[] bytes = Base64.getDecoder().decode(base64);

        if (bytes.length == 0) {
            throw new IllegalStateException("Decoded image is empty");
        }

        return new ImagePayload(bytes, extension);
    }

    private String buildPrompt(Story story) {

        Persona persona = story.getCharacter();

        String name = persona == null ? "the character" : persona.getName();
        String gender = persona == null ? "person" : persona.getGender();
        Integer age = persona == null ? null : persona.getAge();

        String look = story.getLook();

        if (look == null || look.isBlank()) {
            look = persona == null ? "" : persona.getPersonality();
        }

        return """
                Cinematic vertical portrait photograph of %s, a fictional
                %s-year-old Indian %s. %s
                Shot at 50mm, shallow depth of field, natural skin texture,
                soft film grain, moody cinematic lighting that fits a
                %s story. Portrait orientation, 2:3 aspect ratio, subject
                centred with headroom, looking towards the camera.
                No text, no letters, no watermark, no logo.
                """.formatted(
                name,
                age == null ? "" : age,
                gender == null ? "person" : gender,
                look,
                story.getSection() == null ? "romance" : story.getSection()
        );
    }

    private String writePlaceholder(Story story) {

        try {
            Files.createDirectories(imagesDir);
            deleteOldPortraits(story.getId());

            Path file = imagesDir.resolve(story.getId() + ".svg");

            Files.writeString(
                    file,
                    placeholderSvg(story),
                    StandardCharsets.UTF_8
            );

            return "/generated-images/" + file.getFileName();

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Could not write placeholder avatar for " + story.getId(),
                    e
            );
        }
    }

    private void deleteOldPortraits(String storyId) {

        try (var files = Files.list(imagesDir)) {

            files.filter(path ->
                            path.getFileName()
                                    .toString()
                                    .startsWith(storyId + ".")
                    )
                    .forEach(path -> {
                        try {
                            Files.deleteIfExists(path);
                        } catch (IOException ignored) {
                            // A stale portrait is harmless.
                        }
                    });

        } catch (IOException ignored) {
            // Directory does not exist yet.
        }
    }

    private String placeholderSvg(Story story) {

        String name = story.getCharacter() == null
                ? "VEYRA"
                : story.getCharacter().getName();

        String section = story.getSection() == null
                ? "STORY"
                : story.getSection();

        String letter = name == null || name.isBlank()
                ? "V"
                : name.substring(0, 1);

        String[] colours = coloursFor(section);

        return """
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900" role="img" aria-label="%s">
                  <defs>
                    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stop-color="%s"/>
                      <stop offset="0.55" stop-color="%s"/>
                      <stop offset="1" stop-color="%s"/>
                    </linearGradient>
                    <radialGradient id="glow" cx="0.5" cy="0.36" r="0.6">
                      <stop offset="0" stop-color="#ffffff" stop-opacity="0.20"/>
                      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
                    </radialGradient>
                    <linearGradient id="shade" x1="0" y1="0.4" x2="0" y2="1">
                      <stop offset="0" stop-color="#000000" stop-opacity="0"/>
                      <stop offset="1" stop-color="#000000" stop-opacity="0.88"/>
                    </linearGradient>
                  </defs>
                  <rect width="600" height="900" fill="url(#bg)"/>
                  <rect width="600" height="900" fill="url(#glow)"/>
                  <rect width="600" height="900" fill="url(#shade)"/>
                  <text x="300" y="500" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="320" fill="#ffffff" fill-opacity="0.14">%s</text>
                  <text x="300" y="752" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="44" letter-spacing="7" fill="#ffffff" fill-opacity="0.93">%s</text>
                  <text x="300" y="800" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-size="19" letter-spacing="5" fill="#ffffff" fill-opacity="0.55">%s</text>
                </svg>
                """.formatted(
                escape(name),
                colours[0],
                colours[1],
                colours[2],
                escape(letter),
                escape(name == null ? "" : name.toUpperCase()),
                escape(section.toUpperCase())
        );
    }

    private String[] coloursFor(String section) {

        return switch (section == null ? "" : section) {
            case "Romance" -> new String[]{"#2a1a10", "#3d2415", "#5a3a1e"};
            case "Mystery" -> new String[]{"#0d1f1c", "#14332e", "#1f4d44"};
            case "Drama" -> new String[]{"#1b1508", "#2c2310", "#45351a"};
            case "Thriller" -> new String[]{"#0a0f18", "#141d2b", "#1f2c40"};
            case "Late Night" -> new String[]{"#101a2a", "#1a2a44", "#263d5e"};
            default -> new String[]{"#241024", "#3a1a3d", "#55285a"};
        };
    }

    private String escape(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private record ImagePayload(byte[] bytes, String extension) {
    }
}
