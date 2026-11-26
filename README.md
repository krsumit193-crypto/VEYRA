# VEYRA 💗

> Meet someone who remembers.

VEYRA is an AI story-chat app. Pick a world, step into the scene, and talk to a character who remembers what you said.

It is a single Spring Boot app: the Java backend serves the frontend, exposes the story catalog, and talks to OpenRouter for character replies.

---

## ✨ Features

- 💬 AI-powered roleplay chat with per-story characters
- 🎭 18 story worlds, each with its own persona, setting and scenario
- 🗂️ Sections: **Top 5**, **Romance**, **Mystery**, **Drama**, **Thriller**, **Late Night** — every story belongs to exactly one section
- 🌙 One brand-new persona, with its own generated portrait, added automatically every day at 11 PM IST
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
  StoryController.java    GET /stories, POST /stories/daily
  StoryCatalog.java       bundled catalog + generated stories from data/
  Story.java              story + persona model
  StorySummary.java       public shape returned by GET /stories
  Persona.java
  DailyStoryJob.java      scheduler: one new persona every day at 11 PM
  DailyStoryService.java  writes the new persona with the LLM
  AvatarService.java      generates the portrait (SVG fallback)
  WebConfig.java          CORS + serves generated images
src/main/resources/
  application.properties  config
  stories.json            bundled story catalog (source of truth)
  static/                 index.html, script.js, style.css, images/
data/                     created at runtime (gitignored)
  stories.json            daily generated stories
  images/                 daily generated portraits
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
| `openrouter.image.model` | `OPENROUTER_IMAGE_MODEL` | `recraft/recraft-v4.1-flash-v2:free` |
| `veyra.daily.cron` | `VEYRA_DAILY_CRON` | `0 0 23 * * *` (11 PM) |
| `veyra.daily.zone` | `VEYRA_DAILY_ZONE` | `Asia/Kolkata` |
| `veyra.data.dir` | `VEYRA_DATA_DIR` | `data` |
| `veyra.admin.token` | `VEYRA_ADMIN_TOKEN` | empty (manual trigger disabled) |

`openrouter/free` is rate-limited. It also sometimes picks a reasoning-only model that
spends the whole token budget thinking and returns an empty `content` field. VEYRA sends
`reasoning: {"effort":"none"}` with every chat and story-generation request to avoid that;
if replies still fail often, set `OPENROUTER_MODEL` to a paid/less busy model.

Image generation needs a model that returns images (the default does). If it fails, VEYRA writes a local SVG portrait instead, so a story is never left without a picture.

---

## 🔌 API

### `GET /stories`

Returns the public story catalog used by the frontend. Persona, setting and scenario stay server-side and are not exposed.

```json
[
  {
    "id": "story1",
    "title": "The Girl in Seat 27",
    "section": "Top 5",
    "genres": ["Mystery", "Romance", "Drama"],
    "featuredRank": 1,
    "avatar": "images/seat27.png",
    "hook": "She sits beside you every day, but you've never seen her face.",
    "openingMessage": "finally tumne mujhe notice kia.",
    "status": "Online",
    "backgroundClass": "bg-seat27",
    "createdOn": "2026-11-25",
    "newToday": false
  }
]
```

`createdOn` is the date the persona was generated. `newToday` is true only for the
persona generated today in the configured daily zone; the frontend marks that card
with a **NEW TODAY** badge and shows it first in its section.

### `POST /stories/daily`

Manual trigger for the daily generator. Requires `X-Veyra-Admin: <token>` matching `veyra.admin.token`; returns `403` when no token is configured.

### `POST /stories/avatars`

Regenerates portraits for every story that still uses a bundled placeholder. Same admin token. Use it once after adding an image key to fill the whole catalog with generated portraits.

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

## 🌙 Daily personas (automatic)

Every day at **11:00 PM IST** `DailyStoryJob` runs:

1. `DailyStoryService` asks the LLM for one new original story world (title, hook, opening line, persona, setting, scenario, and a one-line look description).
2. It puts the story in the section with the fewest stories (**Romance**, **Mystery**, **Drama**, **Thriller** or **Late Night**).
3. `AvatarService` generates a portrait and stores it in `data/images/`. If image generation fails, it writes an SVG portrait instead.
4. The story is saved to `data/stories.json` and appears on the site immediately.

If the app was closed at 11 PM, the next start catches up on the **missed days**, not
just the latest one — up to three personas are backfilled, each stamped with its own
date. A fresh install does not backfill history: it only adds today when 11 PM has
already passed. If a generation fails (bad key or rate limit), catch-up stops instead
of retrying every remaining day. Change the schedule with `VEYRA_DAILY_CRON` and
`VEYRA_DAILY_ZONE`.

---

## ➕ Adding a persona by hand

Bundled stories live in **`src/main/resources/stories.json`**. Generated ones go to `data/stories.json` and are merged on top.

1. Add a new entry under `"stories"` (for example `"story19"`).
2. Fill in:
   - `id`, `title`
   - `section` — one of `Top 5`, `Romance`, `Mystery`, `Drama`, `Thriller`, `Late Night`
   - `genres` — free-form tags shown on the card
   - `featuredRank` — `1`–`5` for **Top 5**, otherwise `null`
   - `avatar` — path under `static/images/`
   - `hook` — one line for the card
   - `openingMessage` — first chat bubble
   - `status` — usually `"Online"`
   - `backgroundClass` — one of `bg-seat27`, `bg-317`, `bg-fake`, `bg-rival`, `bg-remembers`, `bg-summer`
   - `character` — `name`, `age`, `gender`, `personality`, `backstory`, `speechStyle`, `boundaries`
   - `setting`, `scenario`, `openingBeat`
3. Drop the avatar image into `src/main/resources/static/images/`.
4. Restart the app.

That is it:

- The frontend loads `GET /stories` and renders the card automatically.
- A story appears only in the section named by its `section` field, so no story is repeated across sections.
- The chat prompt automatically receives the new persona, setting and scenario.

No frontend or Java changes are needed for a new persona.

---

## 📝 Notes

- Chat history lives in the browser (`localStorage`, key `veyra_chat_<storyId>`). There is no database.
- The "More" (⋮) button clears the current conversation.
- `data/` is gitignored: generated stories and portraits are runtime content, not source.
- The Python/FastAPI prototype is no longer part of this repository. The Java backend is the only backend.
