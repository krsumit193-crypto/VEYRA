package com.veyra.veyrabackend;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import tools.jackson.databind.json.JsonMapper;

@Component
public class StoryCatalog {

    private static final Logger log =
            LoggerFactory.getLogger(StoryCatalog.class);

    private final JsonMapper jsonMapper;
    private final Path dataFile;

    /** Ships with the app. */
    private final Map<String, Story> bundled = new LinkedHashMap<>();

    /** Written by the daily generator into the data directory. */
    private final Map<String, Story> generated = new LinkedHashMap<>();

    public StoryCatalog(JsonMapper jsonMapper) {
        this(jsonMapper, "data");
    }

    @Autowired
    public StoryCatalog(
            JsonMapper jsonMapper,
            @Value("${veyra.data.dir:data}") String dataDir
    ) {
        this.jsonMapper = jsonMapper;
        this.dataFile = Path.of(dataDir, "stories.json");

        try (InputStream input =
                     new ClassPathResource("stories.json").getInputStream()) {

            bundled.putAll(read(input));

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Could not load stories.json",
                    e
            );
        }

        generated.putAll(readGenerated());
    }

    public synchronized List<Story> getAll() {

        List<Story> all = new ArrayList<>(generated.values());
        all.addAll(bundled.values());

        return all;
    }

    public synchronized Story find(String storyId, String storyTitle) {

        if (storyId != null && !storyId.isBlank()) {
            Story byId = generated.get(storyId);

            if (byId == null) {
                byId = bundled.get(storyId);
            }

            if (byId != null) {
                return byId;
            }
        }

        if (storyTitle != null && !storyTitle.isBlank()) {
            for (Story story : getAll()) {
                if (story.getTitle() != null
                        && story.getTitle().equalsIgnoreCase(storyTitle.trim())) {
                    return story;
                }
            }
        }

        return null;
    }

    public synchronized boolean containsTitle(String title) {

        if (title == null || title.isBlank()) {
            return false;
        }

        String needle = title.trim().toLowerCase();

        for (Story story : getAll()) {
            if (story.getTitle() != null
                    && story.getTitle().trim().toLowerCase().equals(needle)) {
                return true;
            }
        }

        return false;
    }

    public synchronized String nextId() {

        int max = 0;

        for (String id : allIds()) {
            if (id != null && id.startsWith("story")) {
                try {
                    max = Math.max(max, Integer.parseInt(id.substring(5)));
                } catch (NumberFormatException ignored) {
                    // Not a generated-style id, skip it.
                }
            }
        }

        return "story" + (max + 1);
    }

    public synchronized boolean hasGeneratedOn(String date) {

        for (Story story : generated.values()) {
            if (date != null && date.equals(story.getCreatedOn())) {
                return true;
            }
        }

        return false;
    }

    public synchronized void saveGenerated(Story story) {

        if (story == null || story.getId() == null || story.getId().isBlank()) {
            throw new IllegalArgumentException(
                    "A generated story needs an id."
            );
        }

        generated.put(story.getId(), story);
        writeGenerated();
    }

    private List<String> allIds() {

        List<String> ids = new ArrayList<>(generated.keySet());
        ids.addAll(bundled.keySet());

        return ids;
    }

    private Map<String, Story> read(InputStream input) {

        StoryCatalogData data =
                jsonMapper.readValue(input, StoryCatalogData.class);

        return data.getStories() == null
                ? Map.of()
                : data.getStories();
    }

    private Map<String, Story> readGenerated() {

        if (!Files.exists(dataFile)) {
            return Map.of();
        }

        try {
            return read(Files.newInputStream(dataFile));
        } catch (Exception e) {
            log.warn(
                    "VEYRA: could not read {} ({}). Starting without generated stories.",
                    dataFile,
                    e.getMessage()
            );

            return Map.of();
        }
    }

    private void writeGenerated() {

        try {
            Files.createDirectories(dataFile.getParent());

            StoryCatalogData data = new StoryCatalogData();
            data.setStories(new LinkedHashMap<>(generated));

            jsonMapper
                    .writerWithDefaultPrettyPrinter()
                    .writeValue(dataFile.toFile(), data);

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Could not save generated stories to " + dataFile,
                    e
            );
        }
    }

    public static class StoryCatalogData {

        private Map<String, Story> stories;

        public Map<String, Story> getStories() {
            return stories;
        }

        public void setStories(Map<String, Story> stories) {
            this.stories = stories;
        }
    }
}
