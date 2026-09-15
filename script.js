const exploreBtn = document.getElementById("exploreBtn");
const stories = document.getElementById("stories");

exploreBtn.addEventListener("click", () => {

    const targetPosition =
        stories.getBoundingClientRect().top + window.scrollY;

    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 1200;

    let startTime = null;

    function animation(currentTime) {

        if (startTime === null) {
            startTime = currentTime;
        }

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = 1 - Math.pow(1 - progress, 3);

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


/* ================= CREATE STORY ================= */

const createStoryBtn =
    document.getElementById("createStoryBtn");

createStoryBtn.addEventListener("click", () => {

    alert("Your story creation journey starts here!");

});


/* ================= CHAT SCREEN ================= */

const chatScreen =
    document.getElementById("chatScreen");

const chatHeader =
    document.querySelector(".chat-header h2");

const aiMessage =
    document.querySelector(".chat-messages .ai-message");


/* ================= STORY 1 ================= */

const story1 =
    document.getElementById("story1");

story1.addEventListener("click", () => {

    chatScreen.style.display = "block";

    chatHeader.textContent =
        "The Girl in Seat 27";

    aiMessage.textContent =
        "finally tumne mujhe notice kia";

});


/* ================= STORY 2 ================= */

const story2 =
    document.getElementById("story2");

story2.addEventListener("click", () => {

    chatScreen.style.display = "block";

    chatHeader.textContent =
        "3:17 AM";

    aiMessage.textContent =
        "It's 3:17 AM... abhi tak jaag rhe ho?";

});


/* ================= STORY 3 ================= */

const story3 =
    document.getElementById("story3");

story3.addEventListener("click", () => {

    chatScreen.style.display = "block";

    chatHeader.textContent =
        "My Fake Girlfriend";

    aiMessage.textContent =
        "yaad hai na humdono sirf natak kar rhe... right?";

});


/* ================= STORY 4 ================= */

const story4 =
    document.getElementById("story4");

story4.addEventListener("click", () => {

    chatScreen.style.display = "block";

    chatHeader.textContent =
        "The Rival Next Door";

    aiMessage.textContent =
        "tumhe lagta h tum mujhse jeet jaoge?";

});


/* ================= STORY 5 ================= */

const story5 =
    document.getElementById("story5");

story5.addEventListener("click", () => {

    chatScreen.style.display = "block";

    chatHeader.textContent =
        "She Remembers Everything";

    aiMessage.textContent =
        "bhale hi tum bhul gye hoge kya hua tha...mujhe abtk sab yad h";

});


/* ================= STORY 6 ================= */

const story6 =
    document.getElementById("story6");

story6.addEventListener("click", () => {

    chatScreen.style.display = "block";

    chatHeader.textContent =
        "One Summer, One Secret";

    aiMessage.textContent =
        "yad h last summer kya promise kia tha?";

});


/* ================= BACK BUTTON ================= */

const backBtn =
    document.getElementById("backBtn");

backBtn.addEventListener("click", () => {

    chatScreen.style.display = "none";

});


/* ================= CHAT ================= */

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const chatMessages =
    document.querySelector(".chat-messages");

    function addActionMessage(text) {

    const action =
        document.createElement("div");

    action.classList.add(
        "message",
        "action-message"
    );

    action.textContent = text;

    chatMessages.appendChild(action);
}
if (messageText.toLowerCase().includes("seat")) {
    addActionMessage(
        "*Woh thoda surprised hokar tumhari taraf dekhti hai.*"
    );
}


function sendMessage() {

    const messageText =
        messageInput.value.trim();

    if (messageText === "") {
        return;
    }

    const message =
        document.createElement("div");

    message.classList.add(
        "message",
        "user-message"
    );

    message.textContent =
        messageText;

    chatMessages.appendChild(message);

    messageInput.value = "";

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


sendBtn.addEventListener(
    "click",
    sendMessage
);


messageInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();
        }

    }
);


/* ================= LANGUAGE ================= */

const languageSelect =
    document.getElementById("languageSelect");

languageSelect.addEventListener(
    "change",
    () => {

        const selectedLanguage =
            languageSelect.value;

        if (selectedLanguage === "hi") {

            messageInput.placeholder =
                "अपना संदेश लिखें...";

        } else {

            messageInput.placeholder =
                "Type a message...";

        }

    }
);