/* =====================================================
   VEYRA — CHAT SYSTEM
   ===================================================== */

/* =====================================================
   CONFIG
   ===================================================== */

const API_BASE =
    window.VEYRA_API_BASE ||
    (location.protocol === "file:"
        ? "http://localhost:8080"
        : "");

/* =====================================================
   EXPLORE STORIES
   ===================================================== */

const exploreBtn =
    document.getElementById("exploreBtn");

if (exploreBtn) {

    exploreBtn.addEventListener("click", () => {

        window.location.hash = "#stories";

    });

}

/* =====================================================
   CREATE STORY
   ===================================================== */

const createStoryBtn =
    document.getElementById("createStoryBtn");

if (createStoryBtn) {

    createStoryBtn.addEventListener("click", () => {

        window.location.hash = "#create";

    });

}

/* =====================================================
   CHAT ELEMENTS
   ===================================================== */

const chatScreen =
    document.getElementById("chatScreen");

const chatHeader =
    document.querySelector(".chat-header h2");

const chatStatus =
    document.querySelector(".chat-user p");

const chatAvatar =
    document.querySelector(".chat-avatar");

const chatMessages =
    document.querySelector(".chat-messages");

const backBtn =
    document.getElementById("backBtn");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const languageSelect =
    document.getElementById("languageSelect");

const moreBtn =
    document.getElementById("moreBtn");

/* =====================================================
   CHAT STATE
   ===================================================== */

let currentStoryId = null;
let isWaitingForAI = false;
let pendingMessage = "";
let pendingHistory = [];

/* =====================================================
   STORY DATA
   ===================================================== */

const storiesData = {};

const SECTION_ORDER = [
    "Top 5",
    "Romance",
    "Mystery",
    "Drama",
    "Thriller",
    "Late Night"
];

function groupStoriesBySection(stories) {

    const groups = new Map();

    SECTION_ORDER.forEach(title => {
        groups.set(title, []);
    });

    stories.forEach(story => {

        const title =
            story.section || "More";

        if (!groups.has(title)) {
            groups.set(title, []);
        }

        groups.get(title).push(story);

    });

    const top = groups.get("Top 5");

    if (top) {
        top.sort(
            (a, b) =>
                (a.featuredRank || 99) -
                (b.featuredRank || 99)
        );
    }

    /* Today's new persona goes first, without leaving its own section. */
    groups.forEach((matches, title) => {
        if (title !== "Top 5") {
            matches.sort(
                (a, b) =>
                    (b.newToday ? 1 : 0) -
                    (a.newToday ? 1 : 0)
            );
        }
    });

    return groups;

}

/* =====================================================
   CHAT HISTORY — LOCAL STORAGE
   ===================================================== */

function getChatHistory(storyId) {

    const saved =
        localStorage.getItem(
            `veyra_chat_${storyId}`
        );

    if (!saved) {
        return [];
    }

    try {

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            "VEYRA: Could not read chat history.",
            error
        );

        return [];

    }

}

/* =====================================================
   SAVE CHAT HISTORY
   ===================================================== */

function saveChatHistory(
    storyId,
    messages
) {

    if (!storyId) {
        return;
    }

    localStorage.setItem(
        `veyra_chat_${storyId}`,
        JSON.stringify(messages)
    );

}

/* =====================================================
   GET CURRENT TIME
   ===================================================== */

function getCurrentTime() {

    return new Date().toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}

/* =====================================================
   ADD MESSAGE TO HISTORY
   ===================================================== */

function addMessageToHistory(
    type,
    text,
    action = ""
) {

    if (!currentStoryId || !text) {
        return;
    }

    const history =
        getChatHistory(
            currentStoryId
        );

    history.push({

        type:
            type,

        text:
            text,

        action:
            action,

        time:
            getCurrentTime()

    });

    saveChatHistory(
        currentStoryId,
        history
    );

}

/* =====================================================
   CREATE MESSAGE ELEMENT
   ===================================================== */

function createMessageElement(
    messageData
) {

    const message =
        document.createElement("div");

    message.classList.add(
        "message"
    );

    /* MESSAGE TYPE */

    if (
        messageData.type === "user"
    ) {

        message.classList.add(
            "user-message"
        );

    }

    else {

        message.classList.add(
            "ai-message"
        );

    }

/* =================================================
   USER ACTION
   ================================================= */

if (
    messageData.type === "user" &&
    messageData.action &&
    messageData.action.trim() !== ""
) {
    const action = document.createElement("div");

    action.classList.add("user-action");
    action.textContent = messageData.action;

    message.appendChild(action);
}

    /* =================================================
       AI ACTION / THOUGHT
       ================================================= */

    if (
        messageData.type === "ai" &&
        messageData.action &&
        messageData.action.trim() !== ""
    ) {

        const action =
            document.createElement("div");

        action.classList.add(
            "ai-action"
        );

        action.textContent =
            messageData.action;

        message.appendChild(
            action
        );

    }

    /* =================================================
       MESSAGE TEXT
       ================================================= */

    if (
        messageData.text &&
        messageData.text.trim() !== ""
    ) {

        const text =
            document.createElement("span");

           text.classList.add("message-text");

        text.textContent =
            messageData.text;

        message.appendChild(
            text
        );

    }

    /* =================================================
       TIMESTAMP
       ================================================= */

    const meta =
        document.createElement("span");

    meta.classList.add(
        "message-meta"
    );

    meta.textContent =
        messageData.time || "Now";

    /* READ RECEIPT */

    if (
        messageData.type === "user"
    ) {

        meta.textContent +=
            "  ✓✓";

    }

    message.appendChild(
        meta
    );

    return message;

}

/* =====================================================
   RENDER CHAT HISTORY
   ===================================================== */

function renderChatHistory() {

    if (!chatMessages) {
        return;
    }

    chatMessages.innerHTML = "";

    /* DATE */

    const date =
        document.createElement("div");

    date.classList.add(
        "chat-date"
    );

    date.textContent =
        "Today";

    chatMessages.appendChild(
        date
    );

    /* HISTORY */

    const history =
        getChatHistory(
            currentStoryId
        );

    history.forEach(
        messageData => {

            const message =
                createMessageElement(
                    messageData
                );

            chatMessages.appendChild(
                message
            );

        }
    );
    requestAnimationFrame(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

    /* SCROLL TO BOTTOM */

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}

/* =====================================================
   LOAD STORIES FROM BACKEND
   ===================================================== */

async function loadStories() {

    const container =
        document.getElementById("storySections");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(`${API_BASE}/stories`);

        if (!response.ok) {
            throw new Error(
                "Stories request failed: " +
                response.status
            );
        }

        const stories =
            await response.json();

        stories.forEach(story => {
            storiesData[story.id] = story;
        });

        renderStorySections(stories, container);

        applyRoute();

    } catch (error) {

        console.error(
            "VEYRA: Could not load stories.",
            error
        );

        container.innerHTML = `
            <p class="stories-error">
                Stories load nahi ho paayi. Backend chalu hai?
            </p>
        `;

    }

}

/* =====================================================
   RENDER STORY SECTIONS
   ===================================================== */

function renderStorySections(stories, container) {

    container.innerHTML = "";

    const groups =
        groupStoriesBySection(stories);

    groups.forEach((matches, title) => {

        if (matches.length === 0) {
            return;
        }

        const block =
            document.createElement("section");

        block.className = "story-section";
        block.dataset.section = title;

        const heading =
            document.createElement("h2");

        heading.textContent = title;

        block.appendChild(heading);

        const row =
            document.createElement("div");

        row.className = "story-row";

        matches.forEach(story => {
            row.appendChild(createStoryCard(story));
        });

        block.appendChild(row);
        container.appendChild(block);

    });

}

/* =====================================================
   CREATE STORY CARD
   ===================================================== */

function createStoryCard(story) {

    const card =
        document.createElement("article");

    card.className = "story-card";
    card.dataset.storyId = story.id;
    card.tabIndex = 0;

    const image =
        document.createElement("img");

    image.src =
        story.avatar || "images/seat27.png";
    image.alt =
        story.title || "Story";
    image.loading = "lazy";

    card.appendChild(image);

    const info =
        document.createElement("div");

    info.className = "story-info";

    const title =
        document.createElement("h3");

    title.textContent =
        story.title || "Untitled";

    if (story.newToday) {

        const badge =
            document.createElement("span");

        badge.className = "new-badge";
        badge.textContent = "NEW TODAY";

        title.appendChild(badge);

    }

    info.appendChild(title);

    const genres =
        document.createElement("p");

    genres.className = "genre";
    genres.textContent =
        (story.genres || []).join(" · ");

    info.appendChild(genres);

    const hook =
        document.createElement("p");

    hook.className = "hook";
    hook.textContent =
        story.hook || "";

    info.appendChild(hook);
    card.appendChild(info);

    return card;

}

/* =====================================================
   OPEN STORY
   ===================================================== */

function openStory(storyId) {

    const story =
        storiesData[storyId];

    if (!story) {
        return;
    }

    /* CURRENT STORY */

    currentStoryId =
        storyId;

    /* CHARACTER NAME */

    chatHeader.textContent =
        story.title;

    /* STATUS */

    chatStatus.textContent =
        story.status;

    /* PROFILE IMAGE */

    chatAvatar.innerHTML = "";

    const avatarImage =
        document.createElement("img");

    avatarImage.src =
        story.avatar;

    avatarImage.alt =
        story.title;

    chatAvatar.appendChild(
        avatarImage
    );

    /* CHAT BACKGROUND */

    chatMessages.className =
        "chat-messages";

    if (story.backgroundClass) {

        chatMessages.classList.add(
            story.backgroundClass
        );

    }

    /* FIRST OPENING MESSAGE */

    let history =
        getChatHistory(
            storyId
        );

    if (history.length === 0) {

        history = [

            {

                type:
                    "ai",

                text:
                    story.openingMessage,

                time:
                    getCurrentTime()

            }

        ];

        saveChatHistory(
            storyId,
            history
        );

    }

    /* RENDER */

    renderChatHistory();

    /* OPEN CHAT */

    chatScreen.style.display =
        "block";

    /* FOCUS */

    if (messageInput) {

        setTimeout(() => {

            messageInput.focus();

        }, 100);

    }

}

/* =====================================================
   STORY CARD EVENTS
   ===================================================== */

const storySections =
    document.getElementById("storySections");

if (storySections) {

    storySections.addEventListener(
        "click",
        event => {

            const card =
                event.target.closest(".story-card");

            if (card && card.dataset.storyId) {
                openStory(card.dataset.storyId);
            }

        }
    );

    storySections.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter" &&
                event.key !== " "
            ) {
                return;
            }

            const card =
                event.target.closest(".story-card");

            if (card && card.dataset.storyId) {
                event.preventDefault();
                openStory(card.dataset.storyId);
            }

        }
    );

}

/* =====================================================
   BACK BUTTON
   ===================================================== */

if (backBtn) {

    backBtn.addEventListener(
        "click",
        () => {

            chatScreen.style.display =
                "none";

        }
    );

}

/* =====================================================
   ACTION MESSAGE
   ===================================================== */

function addActionMessage(
    text
) {

    if (!text) {
        return;
    }

    const action =
        document.createElement("div");

    action.classList.add(
        "message",
        "action-message"
    );

    action.textContent =
        text;

    chatMessages.appendChild(
        action
    );

    /* SAVE */

    addMessageToHistory(
        "action",
        text
    );

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}

/* =====================================================
   TYPING INDICATOR
   ===================================================== */

function showTypingIndicator() {

    const typing =
        document.createElement("div");

    typing.classList.add(
        "typing-indicator"
    );

    typing.innerHTML = `

        <span class="typing-dot"></span>

        <span class="typing-dot"></span>

        <span class="typing-dot"></span>

    `;

    chatMessages.appendChild(
        typing
    );

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

    return typing;

}

/* =====================================================
   AI RESPONSE
   ===================================================== */

async function sendDemoAIResponse() {

    if (!currentStoryId) {
        return;
    }
isWaitingForAI = true;

if (sendBtn) {
    sendBtn.disabled = true;
}
    const typing =
        showTypingIndicator();

    try {

        const story =
            storiesData[currentStoryId];

        const response =
            await fetch(
                `${API_BASE}/chat`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: pendingMessage,
                        story: story.title,
                        storyId: currentStoryId,
                        language:
                            languageSelect
                                ? languageSelect.value
                                : "hin",
                        history: pendingHistory
                    })
                }
            );

        if (typing) {
            typing.remove();
        }

        if (!response.ok) {
            throw new Error(
                "AI server error: " +
                response.status
            );
        }

        const data =
            await response.json();

const replyText = data.reply || "";
const actionMatch = replyText.match(
    /^\s*\[Character action:\s*([\s\S]*?)\]\s*["']?\s*/i
);

if (actionMatch) {
    if (!data.action || !data.action.trim()) {
        data.action = actionMatch[1].trim();
    }

    data.reply = replyText.substring(actionMatch[0].length).trim();
}
data.reply = data.reply.replace(/["']\s*$/, "").trim();

            console.log("VEYRA raw response:", data);
console.log("Action:", data.action);
console.log("Reply:", data.reply);

        /* =========================================
           AI ACTION + REPLY
           ========================================= */

        if (
            (data.action &&
                data.action.trim() !== "") ||
            (data.reply &&
                data.reply.trim() !== "")
        ) {

            const aiMessage =
                createMessageElement({

                    type:
                        "ai",

                    text:
                        data.reply || "",

                    action:
                        data.action || "",

                    time:
                        getCurrentTime()

                });

            chatMessages.appendChild(
                aiMessage
            );

            addMessageToHistory(

                "ai",

                data.reply || "",

                data.action || ""

            );

        }

        /* SCROLL */

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    }

catch (error) {
    if (typing) {
        typing.remove();
    }

    console.error("VEYRA AI Error:", error);

    let errorText =
        "Hmm... connection thoda slow hai. Ek baar phir try karo 👀";

    if (error.message.startsWith("AI server error:")) {
        errorText =
            "VEYRA abhi reply nahi kar pa raha. Thodi der baad try karo 👀";
    }

    const errorMessage = createMessageElement({
        type: "ai",
        text: errorText,
        action: "",
        time: getCurrentTime()
    });

    chatMessages.appendChild(errorMessage);
    const retryButton = document.createElement("button");

retryButton.textContent = "Retry";
retryButton.className = "retry-button";

retryButton.addEventListener("click", () => {
    retryButton.remove();
    errorMessage.remove();
    sendDemoAIResponse();
});

chatMessages.appendChild(retryButton);

    // Error ko conversation history mein save nahi karna.

    chatMessages.scrollTop = chatMessages.scrollHeight;
}
finally {
    isWaitingForAI = false;

    if (sendBtn) {
        sendBtn.disabled = false;
    }
}
}
/* =====================================================
   SEND MESSAGE
   ===================================================== */

function sendMessage() {
    if (isWaitingForAI) {
    return;
}

    if (!messageInput) {
        return;
    }

    if (!currentStoryId) {
        return;
    }

    const messageText =
        messageInput.value.trim();

    pendingMessage = messageText;

    pendingHistory =
        getChatHistory(currentStoryId);

    /* EMPTY */

    if (messageText === "") {
        return;
    }

    /* =================================================
       USER MESSAGE
       ================================================= */

    const actionMatch = messageText.match(
    /^\*([^*]+)\*\s*([\s\S]*)$/
);

const userAction = actionMatch
    ? actionMatch[1].trim()
    : "";

const userDialogue = actionMatch
    ? actionMatch[2].trim()
    : messageText;

const userMessage = createMessageElement({
    type: "user",
    text: userDialogue,
    action: userAction,
    time: getCurrentTime()
});

    chatMessages.appendChild(
        userMessage
    );

    /* SAVE */

   addMessageToHistory(
    "user",
    userDialogue,
    userAction
);

    /* CLEAR INPUT */

    messageInput.value = "";

    /* =================================================
       SIMPLE STORY REACTION
       ================================================= */

    if (
        messageText
            .toLowerCase()
            .includes("seat")
    ) {

        addActionMessage(
            "*Woh thoda surprised hokar tumhari taraf dekhti hai.*"
        );

    }

    /* =================================================
       DEMO AI TYPING
       ================================================= */

    sendDemoAIResponse();

    /* SCROLL */

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}

/* =====================================================
   SEND BUTTON
   ===================================================== */

if (sendBtn) {

    sendBtn.addEventListener(
        "click",
        sendMessage
    );

}

/* =====================================================
   ENTER KEY
   ===================================================== */

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}

/* =====================================================
   LANGUAGE
   ===================================================== */

if (languageSelect) {

    languageSelect.addEventListener(
        "change",
        () => {

            const selectedLanguage =
                languageSelect.value;

            if (
                selectedLanguage === "hi"
            ) {

                messageInput.placeholder =
                    "अपना संदेश लिखें...";

            }

            else if (
                selectedLanguage === "hin"
            ) {

                messageInput.placeholder =
                    "Kuch likho...";

            }

            else {

                messageInput.placeholder =
                    "Type a message...";

            }

        }
    );

}

/* =====================================================
   CLEAR CURRENT CHAT
   ===================================================== */

function clearCurrentChat() {

    if (!currentStoryId) {

        alert(
            "Pehle koi story open karo."
        );

        return;

    }

    const story =
        storiesData[currentStoryId];

    const confirmed =
        confirm(
            `Clear chat with "${story.title}"?\n\nThis will remove only this conversation.`
        );

    if (!confirmed) {
        return;
    }

    /* REMOVE SAVED CHAT */

    localStorage.removeItem(
        `veyra_chat_${currentStoryId}`
    );

    /* RESTORE OPENING MESSAGE */

    saveChatHistory(

        currentStoryId,

        [

            {

                type:
                    "ai",

                text:
                    story.openingMessage,

                time:
                    getCurrentTime()

            }

        ]

    );

    /* RENDER */

    renderChatHistory();

}

/* =====================================================
   MORE BUTTON
   ===================================================== */

if (moreBtn) {

    moreBtn.addEventListener(
        "click",
        clearCurrentChat
    );

}

/* =====================================================
   INITIAL STATE
   ===================================================== */

if (chatScreen) {

    chatScreen.style.display =
        "none";

}

/* =====================================================
   VEYRA — EMOJI PICKER
   ===================================================== */

/* =====================================================
   VEYRA — EMOJI PICKER
   ===================================================== */

const emojiBtn =
    document.querySelector('.input-icon[title="Emoji"]');

const emojiList = [
    "😀", "😂", "🤣", "😊", "😍",
    "🥰", "😘", "😉", "😏", "😌",
    "😳", "🥺", "😭", "😤", "😒",
    "🙄", "😎", "🤭", "🤔", "👀",
    "❤️", "🖤", "💗", "💜", "🔥",
    "✨", "🤍", "🫶", "👍", "🙏"
];

if (emojiBtn && messageInput) {

    const emojiPicker =
        document.createElement("div");

    emojiPicker.className =
        "emoji-picker";

    emojiList.forEach(emoji => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.textContent = emoji;

        button.addEventListener(
            "click",
            () => {

                messageInput.value += emoji;

                messageInput.focus();

            }
        );

        emojiPicker.appendChild(
            button
        );

    });

    /* Picker ko chat input ke andar rakho */

    const chatInput =
        document.querySelector(".chat-input");

    if (chatInput) {

        chatInput.style.position =
            "relative";

        chatInput.appendChild(
            emojiPicker
        );

    }

    /* Toggle */

    emojiBtn.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            event.stopPropagation();

            emojiPicker.classList.toggle(
                "show"
            );

        }
    );

    /* Outside click */

    document.addEventListener(
        "click",
        event => {

            if (
                !emojiPicker.contains(event.target) &&
                event.target !== emojiBtn
            ) {

                emojiPicker.classList.remove(
                    "show"
                );

            }

        }
    );

}

/* =====================================================
   PAGE ROUTING
   Home / Stories / About / Create + genre tabs
   ===================================================== */

const pageViews =
    Array.from(document.querySelectorAll(".page-view"));

const navLinks =
    Array.from(document.querySelectorAll("nav a[data-nav]"));

const sectionTabs =
    document.getElementById("sectionTabs");

function currentRoute() {

    const hash =
        decodeURIComponent(
            window.location.hash.replace(/^#/, "")
        );

    const parts =
        hash.split("/").filter(Boolean);

    return {
        page: parts[0] || "home",
        section: parts[1] || ""
    };

}

function buildSectionTabs() {

    if (!sectionTabs) {
        return;
    }

    ["All"].concat(SECTION_ORDER).forEach(name => {

        const button =
            document.createElement("button");

        button.type = "button";
        button.textContent = name;
        button.dataset.section = name;

        button.addEventListener("click", () => {

            window.location.hash =
                name === "All"
                    ? "#stories"
                    : `#stories/${encodeURIComponent(name)}`;

        });

        sectionTabs.appendChild(button);

    });

}

function applyRoute() {

    const route =
        currentRoute();

    const page =
        pageViews.some(view => view.dataset.page === route.page)
            ? route.page
            : "home";

    pageViews.forEach(view => {
        view.classList.toggle(
            "active",
            view.dataset.page === page
        );
    });

    navLinks.forEach(link => {
        link.classList.toggle(
            "active",
            link.dataset.nav === page
        );
    });

    if (chatScreen) {
        chatScreen.style.display = "none";
    }

    if (page === "stories") {

        const selected =
            route.section &&
            SECTION_ORDER.includes(route.section)
                ? route.section
                : "All";

        if (sectionTabs) {
            Array.from(sectionTabs.children).forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.section === selected
                );
            });
        }

        document
            .querySelectorAll(".story-section")
            .forEach(block => {
                block.style.display =
                    selected === "All" ||
                    block.dataset.section === selected
                        ? ""
                        : "none";
            });

    }

}

window.addEventListener("hashchange", applyRoute);

buildSectionTabs();
applyRoute();

/* =====================================================
   INIT
   ===================================================== */

loadStories();

