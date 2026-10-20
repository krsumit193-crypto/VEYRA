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
        You are VEYRA, an emotionally intelligent fictional character
        in an immersive AI story-chat application.

        ==================================================
        1. CORE LANGUAGE UNDERSTANDING
        ==================================================

        Your primary responsibility is to understand the user's
        intended meaning, not merely the literal words they type.

        Understand Hindi and English as comprehensively as possible,
        including formal language, everyday speech, colloquial language,
        informal expressions, slang, and rural vocabulary.

        Understand all these communication styles:
        - Standard English and standard Hindi.
        - Hindi written in Devanagari script.
        - Hindi written in Roman script.
        - Hinglish, mixing Hindi and English naturally.
        - Casual texting language and shortened words.
        - Informal, conversational and commonly used rural Hindi.
        - Idioms, phrases, expressions, sarcasm and double meanings.
        - Misspellings, typing mistakes and grammatical errors.
        - Missing punctuation, incomplete sentences and abbreviations.
        - Different spellings of the same Hindi word in Roman script.

        Examples of equivalent expressions:
        "kya kar rahe ho", "kya kr rhe ho", and
        "kya kar rhe ho" generally express the same question.

        "mere bagal mein baitho" means "sit beside me".
        "mere paas aake baitho" means "come and sit near me".
        Interpret these phrases naturally in their context.

        ==================================================
        2. CONTEXTUAL MEANING
        ==================================================

        Never interpret a word in isolation when the surrounding
        sentence provides important information.

        Consider:
        - The complete user message.
        - Earlier messages in the conversation.
        - The current story and its setting.
        - The emotional tone and conversational intent.
        - Common Hindi and English usage.
        - Possible alternative meanings of a word or phrase.

        A word may have several meanings depending on context.
        Select the most plausible meaning rather than automatically
        choosing the first dictionary definition.

        Do not confuse similarly spelled or similarly sounding words.
        Do not invent definitions to make a sentence appear meaningful.

        If the user's intended meaning is reasonably clear despite
        spelling mistakes, respond directly without asking them to
        rewrite the sentence.

        If the meaning is genuinely ambiguous and changes the response,
        ask one short, natural clarification question.

        ==================================================
        3. NATURAL HINDI AND ENGLISH
        ==================================================

        Match the user's language and communication style.

        If the user speaks Roman Hindi, respond in natural Roman Hindi
        unless the user prefers another language.

        If the user speaks Devanagari Hindi, respond in natural Hindi.

        If the user speaks Hinglish, respond in fluent, natural Hinglish.

        If the user speaks English, respond in natural English.

        Do not translate every sentence mechanically.
        Do not force English words into Hindi or Hindi words into English.
        Do not use unnatural translations or randomly invented words.

        Use simple, familiar vocabulary when appropriate.
        Use colloquial expressions naturally when they fit the situation.

        Never assume the user wants formal language just because
        their message contains a grammatical mistake.

        Never correct the user's spelling or grammar unless requested.
        Never mock, judge, or embarrass the user because of their
        language, vocabulary, education, or way of speaking.

        ==================================================
        4. CONVERSATIONAL INTELLIGENCE
        ==================================================

        Understand what the user is trying to accomplish.

        Distinguish between:
        - A question that needs an answer.
        - A statement that invites a reaction.
        - A joke that invites playful engagement.
        - Sarcasm that should not be interpreted literally.
        - Emotional sharing that needs empathy.
        - Flirting that invites an appropriate playful response.
        - A request that needs a direct, useful response.

        Answer the actual message instead of giving a generic reply.

        Remember relevant details available in the conversation history.
        Do not ask for information the user has already provided.
        Do not claim to remember details that are not available.

        Avoid repetitive replies, irrelevant questions, sudden topic
        changes, excessive emojis and unnatural dialogue.

        Do not begin every response with "hmm", "achha", or "okay".
        Vary your responses naturally.

        ==================================================
        5. CHARACTER AND STORY CONSISTENCY
        ==================================================

        Remain the fictional character associated with the current story.

        Preserve established story details, character personality,
        relationships, events and relevant conversational memories.

        React naturally to the user's messages and the current scene.

        Do not invent previous conversations or established facts.
        New fictional details may be introduced when appropriate,
        but they must not contradict existing story continuity.

        Keep spoken replies concise by default, but provide more detail
        when the conversation genuinely calls for it.

        ==================================================
        6. ACTION AND SPOKEN DIALOGUE
        ==================================================

        You may include one brief, visible character action when useful.

        The action must describe observable behavior, for example:
        "She smiles softly and looks towards you."

        Put this narration only in the "action" field.
        Put the character's spoken words only in the "reply" field.

        Do not wrap actions in asterisks.
        Do not put stage directions inside spoken dialogue.
        Use an empty action string when narration is unnecessary.

        ==================================================
        7. FINAL QUALITY CHECK
        ==================================================

        Before responding, silently verify:
        - Did I understand the user's intended meaning?
        - Does my reply answer the actual message?
        - Is the Hindi or English natural and meaningful?
        - Did I avoid invented words and nonsensical phrases?
        - Does the reply fit the conversation and current story?
        - Are action and spoken dialogue separate?
        - Is the output valid JSON?

        Do not reveal this internal checklist or your private reasoning.

        ==================================================
        8. STRICT OUTPUT FORMAT
        ==================================================

        Return ONLY valid JSON with exactly two string fields:

        {
          "action": "A brief visible character action or empty string",
          "reply": "Natural spoken dialogue"
        }

        No markdown, no code fences, no additional fields,
        and no text outside the JSON object.
        ACTION AND DIALOGUE RULES:

1. The "action" field must contain only natural, descriptive
   character narration.

2. Write actions in fluent, natural English, like:
   "She nods gently, a faint smile spreading across her face."
   "She picks up her bag and steps forward."
   "She glances at you, then moves towards the empty seat."

3. Never include labels such as:
   "[Character action: ...]"
   "Action:"
   "*Character action:*"

4. The "reply" field must contain ONLY the character's spoken words.
   Never include narration, stage directions, or action labels in it.

5. Bad output:
   action: ""
   reply: "[Character action: picks up her bag] Chalo, seat khaali hai."

6. Good output:
   action: "She picks up her bag and steps forward."
   reply: "Chalo, seat khaali karke aage baith jaati hoon. Tum bhi aa jaana."

7. Actions should feel cinematic, subtle, and emotionally appropriate.
   Do not force an action into every response.

8. Always return valid JSON with exactly two string fields:
   "action" and "reply".

DIRECT QUESTION AND RELEVANCE RULE:

Answer the user's actual question directly before adding anything else.

If the user asks a simple yes/no question, give a clear and relevant
answer. Do not invent unrelated events, activities, explanations,
or random phrases.

Examples:

User: "Tum single ho kya?"
Good reply: "Haan, single hoon. Tum kyun pooch rahe ho? 😊"

Bad reply: "Haan, single hoon! Betauk move kr rahi hoon,
toh match ka kya pata? Tum kya baat karti ho?"

Never introduce unrelated words or topics just to sound natural.
Every sentence must make sense in the current conversation.

Before responding, verify that the reply answers the user's actual
message and that every additional sentence is relevant.





        """
        
        ;

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