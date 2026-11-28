package com.veyra.veyrabackend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.json.JsonMapper;

class ChatServiceTest {

    private ChatService service;
    private StoryCatalog catalog;

    @BeforeEach
    void setUp() {
        JsonMapper jsonMapper = JsonMapper.builder().build();
        catalog = new StoryCatalog(jsonMapper);
        service = new ChatService(
                RestClient.builder(),
                jsonMapper,
                catalog
        );
    }

    @Test
    void loadsStoryCatalog() {
        Story story = catalog.find("story1", null);

        assertNotNull(story);
        assertEquals("The Girl in Seat 27", story.getTitle());
        assertEquals("Meera", story.getCharacter().getName());
        assertEquals(18, catalog.getAll().size());
        assertEquals("Top 5", story.getSection());
        assertEquals(List.of("Mystery", "Romance", "Drama"), story.getGenres());
        assertEquals(1, story.getFeaturedRank());
    }

    @Test
    void resolvesStoryByTitleWhenIdIsMissing() {
        Story story = catalog.find(null, "The Rival Next Door");

        assertNotNull(story);
        assertEquals("story4", story.getId());
    }

    @Test
    void parsesValidJson() {
        ChatResponse response = service.parseAIResponse(
                "{\"action\":\"She smiles.\",\"reply\":\"Hey tum.\"}"
        );

        assertEquals("She smiles.", response.getAction());
        assertEquals("Hey tum.", response.getReply());
    }

    @Test
    void parsesFencedJson() {
        ChatResponse response = service.parseAIResponse(
                "```json\n{\"action\":\"\",\"reply\":\"Haan.\"}\n```"
        );

        assertEquals("", response.getAction());
        assertEquals("Haan.", response.getReply());
    }

    @Test
    void extractsActionPrefixFromReply() {
        ChatResponse response = service.parseAIResponse(
                "{\"action\":\"\",\"reply\":\"[Character action: She looks away] Chalo.\"}"
        );

        assertEquals("She looks away", response.getAction());
        assertEquals("Chalo.", response.getReply());
    }

    @Test
    void stripsSurroundingQuotes() {
        ChatResponse response = service.parseAIResponse(
                "{\"action\":\"\",\"reply\":\"\\\"Kya hua?\\\"\"}"
        );

        assertEquals("Kya hua?", response.getReply());
    }

    @Test
    void fallsBackToRawTextWhenJsonIsBroken() {
        ChatResponse response = service.parseAIResponse("not json at all");

        assertEquals("", response.getAction());
        assertEquals("not json at all", response.getReply());
    }

    @Test
    void splitsLabeledPlainTextReply() {
        ChatResponse response = service.parseAIResponse(
                "action: She raises an eyebrow.\nreply: \"Huh? Ab toh pata chala.\""
        );

        assertEquals("She raises an eyebrow.", response.getAction());
        assertEquals("Huh? Ab toh pata chala.", response.getReply());
    }

    @Test
    void splitsLabeledPlainTextReplyWithoutAction() {
        ChatResponse response = service.parseAIResponse("reply: \"Haan.\"");

        assertEquals("", response.getAction());
        assertEquals("Haan.", response.getReply());
    }
}
