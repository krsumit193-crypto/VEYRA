package com.veyra.veyrabackend;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class ChatService {

    private final RestClient restClient;
    private final JsonMapper jsonMapper;

    @Value("${openrouter.api.key}")
    private String apiKey;

    public ChatService(
            RestClient.Builder restClientBuilder,
            JsonMapper jsonMapper
    ) {
        this.restClient = restClientBuilder
                .baseUrl("https://openrouter.ai/api/v1")
                .build();

        this.jsonMapper = jsonMapper;
    }

    public ChatResponse generateReply(ChatRequest request) {

        String systemPrompt = """
                You are a fictional character inside VEYRA,
                a social AI story chat app.

                Talk naturally like a real young Indian person
                chatting casually.

                Understand natural Indian Hinglish and Roman Hindi
                from the full sentence and conversation context.

                Match the user's language style.

                If the user writes Hinglish, reply in natural Hinglish.

                Understand Roman Hindi naturally from context.
                Do not interpret words literally when the full sentence
                clearly indicates another meaning.

                For example:
                "mai tumhare bagal me baithu?"
                means "Can I sit beside you?"

                "seat share kare?"
                means "Can we share the seat?"

                Keep the spoken reply short, natural and human-like.

                Stay consistent with the current story.

                You may include one short visible character action.

                IMPORTANT:
                Return ONLY valid JSON.

                The JSON must have exactly two fields:

                {
                    "action": "short visible character action",
                    "reply": "spoken dialogue"
                }

                The action and reply must be separate.

                Do not put the action inside the reply.

                Do not use markdown or code fences.
                """;

        String userMessage = """
                Current story: %s

                User message: %s
                """.formatted(
                request.getStory(),
                request.getMessage()
        );

        /*
         * Create the conversation messages.
         *
         * First message = VEYRA system instructions.
         */
        List<Map<String, String>> messages =
                new ArrayList<>();

        messages.add(
                Map.of(
                        "role", "system",
                        "content", systemPrompt
                )
        );

        /*
         * Add previous conversation history.
         */
        if (request.getHistory() != null) {

            for (ChatMessage chatMessage : request.getHistory()) {

                String role;

                if ("user".equals(chatMessage.getType())) {
                    role = "user";
                } else {
                    role = "assistant";
                }

                String content = chatMessage.getText();

                /*
                 * Include character action as context
                 * for the AI, but keep it separate from
                 * the spoken dialogue conceptually.
                 */
                if (chatMessage.getAction() != null
                        && !chatMessage.getAction().isBlank()) {

                    content =
                            "[Character action: "
                            + chatMessage.getAction()
                            + "]\n"
                            + content;
                }

                if (content != null && !content.isBlank()) {

                    messages.add(
                            Map.of(
                                    "role", role,
                                    "content", content
                            )
                    );
                }
            }
        }

        /*
         * Add current story and current user message.
         *
         * We add the current message separately because
         * it is the message AI needs to answer now.
         */
        messages.add(
                Map.of(
                        "role", "user",
                        "content", userMessage
                )
        );

        Map<String, Object> requestBody = Map.of(
                "model", "openrouter/free",
                "messages", messages
        );

        try {

            String responseBody = restClient
                    .post()
                    .uri("/chat/completions")
                    .header(
                            "Authorization",
                            "Bearer " + apiKey
                    )
                    .header(
                            "Content-Type",
                            "application/json"
                    )
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            if (responseBody == null || responseBody.isBlank()) {

                throw new RuntimeException(
                        "OpenRouter returned an empty response."
                );
            }

            JsonNode responseJson =
                    jsonMapper.readTree(responseBody);

            String aiContent = responseJson
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText("");

            if (aiContent.isBlank()) {

                throw new RuntimeException(
                        "AI response content is empty."
                );
            }

            return parseAIResponse(aiContent);

        } catch (Exception e) {

            System.out.println(
                    "OpenRouter Error: " + e.getMessage()
            );

            throw new RuntimeException(
                    "Failed to get response from OpenRouter.",
                    e
            );
        }
    }

    private ChatResponse parseAIResponse(String aiContent) {

        try {

            String cleanContent = aiContent
                    .replace("```json", "")
                    .replace("```", "")
                    .trim();

            return jsonMapper.readValue(
                    cleanContent,
                    ChatResponse.class
            );

        } catch (Exception e) {

            ChatResponse fallback =
                    new ChatResponse();

            fallback.setAction("");
            fallback.setReply(aiContent);

            return fallback;
        }
    }
}