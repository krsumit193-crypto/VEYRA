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
let isWaitingForAI = false;


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

        function generateSmartReply(userText, storyId, language) {
    const text = userText.toLowerCase().trim();

    const replies = {
        story1: {
            en: {
                hello: "Hey... took you long enough to say hello 👀",
                who: "Maybe I'm the girl from seat 27... maybe I'm not.",
                seat: "Seat 27 has a story. You sure you want to hear it?",
                default: "Hmm... you really are curious, aren't you?"
            },
            hi: {
                hello: "हेलो... आखिर तुमने मुझसे बात कर ही ली 👀",
                who: "शायद मैं seat 27 वाली लड़की हूँ... शायद नहीं।",
                seat: "Seat 27 की एक कहानी है। सच में सुनना चाहते हो?",
                default: "हम्म... तुम काफी curious हो, है ना?"
            },
            hin: {
                hello: "Hey... finally tumne hello bol hi diya 👀",
                who: "Maybe main seat 27 wali girl hoon... maybe nahi.",
                seat: "Seat 27 ki ek story hai. Sach mein sunna hai?",
                default: "Hmm... tum kaafi curious ho, hai na?"
            }
        },

        story2: {
            en: {
                hello: "3:17 AM and you're saying hello? Interesting.",
                who: "Someone who knows you're still awake.",
                default: "It's late... maybe we shouldn't be talking. Or maybe we should."
            },
            hi: {
                hello: "3:17 AM पर hello? Interesting.",
                who: "कोई ऐसा जो जानता है कि तुम अभी भी जाग रहे हो।",
                default: "बहुत देर हो चुकी है... शायद हमें बात नहीं करनी चाहिए। या शायद करनी चाहिए।"
            },
            hin: {
                hello: "3:17 AM pe hello? Interesting 👀",
                who: "Koi aisa jo jaanta hai tum abhi bhi jaag rahe ho.",
                default: "Bahut late ho gaya hai... shayad hume baat nahi karni chahiye. Ya shayad karni chahiye."
            }
        },

        story3: {
            en: {
                hello: "Hey... remember, we're supposed to be pretending 😏",
                who: "Your fake girlfriend. Don't tell me you forgot already.",
                default: "Careful... you're making this feel less fake."
            },
            hi: {
                hello: "Hey... याद है ना, हमें pretend करना है 😏",
                who: "तुम्हारी fake girlfriend. इतनी जल्दी भूल गए?",
                default: "संभलकर... तुम इसे थोड़ा कम fake बना रहे हो।"
            },
            hin: {
                hello: "Hey... yaad hai na, hume pretend karna hai 😏",
                who: "Tumhari fake girlfriend. Itni jaldi bhool gaye?",
                default: "Careful... tum ise thoda kam fake bana rahe ho."
            }
        },

        story4: {
            en: {
                hello: "Hello, rival. Ready to lose? 😏",
                default: "You talk confidently... let's see if you can back it up."
            },
            hi: {
                hello: "Hello, rival. हारने के लिए ready हो? 😏",
                default: "बातें तो बहुत confidence से करते हो... देखते हैं करके भी दिखा पाते हो या नहीं।"
            },
            hin: {
                hello: "Hello rival. Haarne ke liye ready ho? 😏",
                default: "Baatein toh confidence se karte ho... dekhte hain karke bhi dikha paate ho ya nahi."
            }
        },

        story5: {
            en: {
                hello: "I remember that hello too.",
                who: "Someone who remembers more than you think.",
                default: "You really don't remember what happened, do you?"
            },
            hi: {
                hello: "मुझे वो hello भी याद है।",
                who: "कोई ऐसा जिसे तुम्हारे सोचने से ज्यादा याद है।",
                default: "तुम्हें सच में याद नहीं है कि क्या हुआ था, है ना?"
            },
            hin: {
                hello: "Mujhe woh hello bhi yaad hai.",
                who: "Koi aisa jise tumhare sochne se zyada yaad hai.",
                default: "Tumhe sach mein yaad nahi hai kya hua tha, hai na?"
            }
        },

        story6: {
            en: {
                hello: "Hey... it's been a while.",
                default: "That summer feels like yesterday, doesn't it?"
            },
            hi: {
                hello: "Hey... काफी समय हो गया।",
                default: "वो summer ऐसा लगता है जैसे कल की ही बात हो, है ना?"
            },
            hin: {
                hello: "Hey... kaafi time ho gaya.",
                default: "Woh summer aisa lagta hai jaise kal ki hi baat ho, hai na?"
            }
        }
    };

    const story = replies[storyId];

    if (!story) {
        return "Hmm... interesting 👀";
    }

    const lang = story[language] || story.hin;

    if (
        text.includes("hello") ||
        text.includes("hi") ||
        text.includes("hey")
    ) {
        return lang.hello;
    }

    if (
        text.includes("who") ||
        text.includes("kaun") ||
        text.includes("kon")
    ) {
        return lang.who || lang.default;
    }

    if (text.includes("seat")) {
        return lang.seat || lang.default;
    }

    return lang.default;
}

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
                "http://localhost:8080/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                   body: JSON.stringify({
    message: window.lastUserMessage || "",
    story: story.title,
history: getChatHistory(currentStoryId).filter(
    message => message.type !== "user" ||
        message.text !== window.lastUserMessage
)
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

    // Error ko conversation history mein save nahi karna.

    chatMessages.scrollTop = chatMessages.scrollHeight;
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

        window.lastUserMessage = messageText;


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


