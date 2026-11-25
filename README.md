# VEYRA 💗

> Meet someone who remembers.

VEYRA is an AI story-chat app. Pick a world, step into the scene, and talk to a character who remembers what you said.

It is a single Spring Boot app: the Java backend serves the frontend, exposes the story catalog, and talks to OpenRouter for character replies.

---

## ✨ Features

- 💬 AI-powered roleplay chat with per-story characters
- 🎭 12 story worlds, each with its own persona, setting and scenario
- 🗂️ Auto-generated sections: **Top 5**, **Romance**, **Comedy**, **Mystery**, **Drama**, **Late Night**
- 🌐 English, Hindi & Hinglish replies (language selector in the chat header)
- 😊 Emoji picker
- ⏱️ Message timestamps and ✓✓ read indicators
- ⌨️ Typing indicator and retry on failure
- 💾 Chat history saved per story in `localStorage`
- 📱 Responsive dark UI

---

## 🧱 Tech stack

- **Java 21** + **Spring Boot 4**
- `RestClient` → OpenRouter chat completions
- Plain HTML / CSS / JavaScript frontend served from `src/main/resources/static`
- Maven (wrapper included)

---

## 📁 Project structure

```
pom.xml
src/main/java/com/veyra/veyrabackend/
  ChatController.java     POST /chat
  ChatService.java        prompt building + OpenRouter call + response parsing
  StoryController.java    GET /stories
  StoryCatalog.java       loads stories.json
  Story.java              story + persona model
  Persona.java
  WebConfig.java          CORS for local dev
src/main/resources/
  application.properties  config
  stories.json            single source of truth for stories and personas
  static/                 index.html, script.js, style.css, images/
```

---

## 🚀 Getting started

### Prerequisites

- JDK 21+
- An [OpenRouter](https://openrouter.ai/) API key

### Run

```bash
# Windows
set OPENROUTER_API_KEY=your_key_here

# macOS / Linux
export OPENROUTER_API_KEY=your_key_here

./mvnw spring-boot:run
```

Open <http://localhost:8080>.

The frontend is served by Spring Boot, so there is nothing else to start.

### Tests

```bash
./mvnw test
```

---

## ⚙️ Configuration

| Property | Env var | Default |
|---|---|---|
| `openrouter.api.key` | `OPENROUTER_API_KEY` | empty |
| `openrouter.model` | `OPENROUTER_MODEL` | `openrouter/free` |

`openrouter/free` is rate-limited. If replies fail often, set `OPENROUTER_MODEL` to a paid/less busy model.

---

## 🔌 API

### `GET /stories`

Returns the public story catalog used by the frontend. Persona, setting and scenario stay server-side and are not exposed.

```json
[
  {
    "id": "story1",
    "title": "The Girl in Seat 27",
    "genres": ["Mystery", "Romance", "Drama"],
    "featuredRank": 1,
    "avatar": "images/seat27.png",
    "hook": "She sits beside you every day, but you've never seen her face.",
    "openingMessage": "finally tumne mujhe notice kia.",
    "status": "Online",
    "backgroundClass": "bg-seat27"
  }
]
```

### `POST /chat`

```json
{
  "message": "kya kar rahi ho?",
  "storyId": "story1",
  "language": "hin",
  "history": [
    { "type": "ai", "text": "finally tumne mujhe notice kia.", "action": "" }
  ]
}
```

Response:

```json
{
  "action": "She looks up, a small smile forming.",
  "reply": "Kuch nahi... tumhara wait kar rahi thi."
}
```

`storyId` is preferred. `story` (title) is still accepted as a fallback for older clients.

---

## ➕ Adding a new persona (daily workflow)

Everything is driven by one file: **`src/main/resources/stories.json`**.

1. Add a new entry under `"stories"` (for example `"story13"`).
2. Fill in:
   - `id`, `title`
   - `genres` — any of `Romance`, `Comedy`, `Mystery`, `Drama`, `Late Night`, `Emotional`
   - `featuredRank` — `1`–`5` to appear in **Top 5**, or `null`
   - `avatar` — path under `static/images/`
   - `hook` — one line for the card
   - `openingMessage` — first chat bubble
   - `status` — usually `"Online"`
   - `character` — `name`, `age`, `gender`, `personality`, `backstory`, `speechStyle`, `boundaries`
   - `setting`, `scenario`, `openingBeat`
3. Drop the avatar image into `src/main/resources/static/images/`.
4. Restart the app.

That is it:

- The frontend loads `GET /stories` and renders the card automatically.
- Sections are generated from `genres` and `featuredRank`, so a new Romance story appears under **Romance** without touching HTML.
- The chat prompt automatically receives the new persona, setting and scenario.

No frontend or Java changes are needed for a new persona.

---

## 📝 Notes

- Chat history lives in the browser (`localStorage`, key `veyra_chat_<storyId>`). There is no database.
- The "More" (⋮) button clears the current conversation.
- The Python/FastAPI prototype is no longer part of this repository. The Java backend is the only backend.
