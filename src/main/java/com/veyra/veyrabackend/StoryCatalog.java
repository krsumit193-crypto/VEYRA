package com.veyra.veyrabackend;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import tools.jackson.databind.json.JsonMapper;

@Component
public class StoryCatalog {

    private final Map<String, Story> stories;

    public StoryCatalog(JsonMapper jsonMapper) {
        try (InputStream input =
                     new ClassPathResource("stories.json").getInputStream()) {

            StoryCatalogData data =
                    jsonMapper.readValue(input, StoryCatalogData.class);

            this.stories = data.getStories();

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Could not load stories.json",
                    e
            );
        }
    }

    public List<Story> getAll() {
        return new ArrayList<>(stories.values());
    }

    public Story find(String storyId, String storyTitle) {

        if (storyId != null && !storyId.isBlank()) {
            Story byId = stories.get(storyId);

            if (byId != null) {
                return byId;
            }
        }

        if (storyTitle != null && !storyTitle.isBlank()) {
            for (Story story : stories.values()) {
                if (story.getTitle() != null
                        && story.getTitle().equalsIgnoreCase(storyTitle.trim())) {
                    return story;
                }
            }
        }

        return null;
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
