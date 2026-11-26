package com.veyra.veyrabackend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.json.JsonMapper;

class DailyStoryTest {

    @TempDir
    Path dataDir;

    private JsonMapper jsonMapper;
    private StoryCatalog catalog;
    private DailyStoryService service;

    @BeforeEach
    void setUp() {
        jsonMapper = JsonMapper.builder().build();
        catalog = new StoryCatalog(jsonMapper, dataDir.toString());

        AvatarService avatars = new AvatarService(
                RestClient.builder(),
                jsonMapper,
                dataDir.toString()
        );

        service = new DailyStoryService(
                RestClient.builder(),
                jsonMapper,
                catalog,
                avatars,
                "Asia/Kolkata"
        );
    }

    @Test
    void parsesGeneratedStoryJson() {

        Story story = service.parseStory("""
                ```json
                {
                  "title": "Neon Rain",
                  "genres": ["Romance"],
                  "openingMessage": "baarish rukne ka wait kar rahe ho?",
                  "character": {
                    "name": "Aarohi",
                    "age": 24,
                    "gender": "female"
                  }
                }
                ```
                """);

        assertEquals("Neon Rain", story.getTitle());
        assertEquals("Aarohi", story.getCharacter().getName());
        assertEquals(24, story.getCharacter().getAge());
    }

    @Test
    void rejectsIncompleteGeneratedStory() {

        assertThrows(
                IllegalStateException.class,
                () -> service.parseStory("{\"title\":\"Only a title\"}")
        );
    }

    @Test
    void assignsSequentialIds() {

        assertEquals("story19", catalog.nextId());
    }

    @Test
    void savesGeneratedStoryAndReloadsIt() {

        Story story = new Story();
        story.setId("story19");
        story.setTitle("Neon Rain");
        story.setSection("Romance");
        story.setGenres(List.of("Romance"));
        story.setCreatedOn("2026-11-25");

        catalog.saveGenerated(story);

        StoryCatalog reloaded =
                new StoryCatalog(jsonMapper, dataDir.toString());

        assertEquals(19, reloaded.getAll().size());
        assertNotNull(reloaded.find("story19", null));
        assertTrue(reloaded.containsTitle("neon rain"));
        assertTrue(reloaded.hasGeneratedOn("2026-11-25"));
    }

    @Test
    void findsTheLatestGeneratedDateAndIgnoresMissingDates() {

        assertNull(catalog.latestGeneratedDate());

        Story older = new Story();
        older.setId("story19");
        older.setCreatedOn("2026-11-24");

        Story newer = new Story();
        newer.setId("story20");
        newer.setCreatedOn("2026-11-26");

        Story noDate = new Story();
        noDate.setId("story21");

        catalog.saveGenerated(older);
        catalog.saveGenerated(newer);
        catalog.saveGenerated(noDate);

        assertEquals(
                LocalDate.of(2026, 11, 26),
                catalog.latestGeneratedDate()
        );
    }

    @Test
    void summaryMarksOnlyTodaysPersonaAsNew() {

        Story story = new Story();
        story.setId("story19");
        story.setTitle("Neon Rain");
        story.setCreatedOn("2026-11-26");

        assertTrue(StorySummary.from(story, "2026-11-26").newToday());
        assertFalse(StorySummary.from(story, "2026-11-25").newToday());
        assertFalse(StorySummary.from(story).newToday());
        assertEquals("2026-11-26", StorySummary.from(story).createdOn());
    }
}
