/* =====================================================
   VEYRA — CHAT SYSTEM
   ===================================================== */


/* =====================================================
   EXPLORE STORIES
   ===================================================== */

const exploreBtn =
    document.getElementById("exploreBtn");

const storiesSection =
    document.getElementById("stories");


if (exploreBtn && storiesSection) {

    exploreBtn.addEventListener("click", () => {

        const startPosition =
            window.scrollY;

        const targetPosition =
            storiesSection.getBoundingClientRect().top +
            window.scrollY;

        const distance =
            targetPosition - startPosition;

        const duration = 1200;

        let startTime = null;


        function animation(currentTime) {

            if (startTime === null) {
                startTime = currentTime;
            }

            const elapsed =
                currentTime - startTime;

            const progress =
                Math.min(elapsed / duration, 1);

            const ease =
                1 - Math.pow(1 - progress, 3);


            window.scrollTo(
                0,
                startPosition + distance * ease
            );


            if (progress < 1) {
                requestAnimationFrame(animation);
            }

        }


        requestAnimationFrame(animation);

    });

}


/* =====================================================
   CREATE STORY
   ===================================================== */

const createStoryBtn =
    document.getElementById("createStoryBtn");


if (createStoryBtn) {

    createStoryBtn.addEventListener("click", () => {

        alert(
            "Your story creation journey starts here!"
        );

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


/* =====================================================
   STORY DATA
   ===================================================== */

const storiesData = {

    story1: {

        title:
            "The Girl in Seat 27",

        avatar:
            "images/seat27.png",

        background:
            "images/seat27.png",

        backgroundClass:
            "bg-seat27",

        message:
            "finally tumne mujhe notice kia.",

        status:
            "Online"

    },


    story2: {

        title:
            "3:17 AM",

        avatar:
            "images/317am.png",

        background:
            "images/317am.png",

        backgroundClass:
            "bg-317",

        message:
            "It's 3:17 AM... abhi tak jaag rhe ho?",

        status:
            "Online"

    },


    story3: {

        title:
            "My Fake Girlfriend",

        avatar:
            "images/fakegirlfriend.png",

        background:
            "images/fakegirlfriend.png",

        backgroundClass:
            "bg-fake",

        message:
            "yaad hai na humdono sirf natak kar rhe... right?",

        status:
            "Online"

    },


    story4: {

        title:
            "The Rival Next Door",

        avatar:
            "images/nextdoor.png",

        background:
            "images/nextdoor.png",

        backgroundClass:
            "bg-rival",

        message:
            "tumhe lagta h tum mujhse jeet jaoge?",

        status:
            "Online"

    },


    story5: {

        title:
            "She Remembers Everything",

        avatar:
            "images/remembers.png",

        background:
            "images/remembers.png",

        backgroundClass:
            "bg-remembers",

        message:
            "bhale hi tum bhul gye hoge kya hua tha... mujhe abtk sab yad h",

        status:
            "Online"

    },


    story6: {

        title:
            "One Summer, One Secret",

        avatar:
            "images/summersecret.png",

        background:
            "images/summersecret.png",

        backgroundClass:
            "bg-summer",

        message:
            "yad h last summer kya promise kia tha?",

        status:
            "Online"

    }

};


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
    text
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

    else if (
        messageData.type === "action"
    ) {

        message.classList.add(
            "action-message"
        );

    }

    else {

        message.classList.add(
            "ai-message"
        );

    }


    /* MESSAGE TEXT */

    const text =
        document.createElement("span");


    text.textContent =
        messageData.text;


    message.appendChild(
        text
    );


    /* =================================================
       TIMESTAMP
       ================================================= */

    if (
        messageData.type !== "action"
    ) {

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

    }


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


    /* SCROLL TO BOTTOM */

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

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
                    story.message,

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

document
    .querySelectorAll(".story-card")
    .forEach(card => {

        card.addEventListener(
            "click",
            () => {

                openStory(
                    card.id
                );

            }
        );

    });


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
   DEMO AI RESPONSE
   ===================================================== */

function sendDemoAIResponse() {

    if (!currentStoryId) {
        return;
    }


    const typing =
        showTypingIndicator();


    setTimeout(() => {

        if (typing) {
            typing.remove();
        }


        const aiText =
            "hmm... interesting 👀";


        const aiMessage =
            createMessageElement({

                type:
                    "ai",

                text:
                    aiText,

                time:
                    getCurrentTime()

            });


        chatMessages.appendChild(
            aiMessage
        );


        /* SAVE AI MESSAGE */

        addMessageToHistory(
            "ai",
            aiText
        );


        chatMessages.scrollTop =
            chatMessages.scrollHeight;


    }, 1200);

}


/* =====================================================
   SEND MESSAGE
   ===================================================== */

function sendMessage() {

    if (!messageInput) {
        return;
    }


    if (!currentStoryId) {
        return;
    }


    const messageText =
        messageInput.value.trim();


    /* EMPTY */

    if (messageText === "") {
        return;
    }


    /* =================================================
       USER MESSAGE
       ================================================= */

    const userMessage =
        createMessageElement({

            type:
                "user",

            text:
                messageText,

            time:
                getCurrentTime()

        });


    chatMessages.appendChild(
        userMessage
    );


    /* SAVE */

    addMessageToHistory(
        "user",
        messageText
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
                    story.message,

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