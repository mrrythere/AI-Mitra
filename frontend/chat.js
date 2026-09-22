// =========================================================
// AI-MITRA
// Chapter 10 — Real Multi-Mitra Chat Integration
// =========================================================

const API_BASE_URL =
    "https://ai-mitra-dc74.onrender.com";


// =========================================================
// AUTH + SELECTED MITRA
// =========================================================

const token =
    sessionStorage.getItem("ai_mitra_token");

const pageParams =
    new URLSearchParams(
        window.location.search
    );

const mitraId =
    pageParams.get("mitra");


if (!token) {

    window.location.href =
        "index.html";

}


if (!mitraId) {

    window.location.href =
        "dashboard.html";

}


// =========================================================
// ELEMENTS
// =========================================================

const chatForm =
    document.getElementById("chatForm");

const messageInput =
    document.getElementById("messageInput");

const chatMessages =
    document.getElementById("chatMessages");

const typingIndicator =
    document.getElementById("typingIndicator");

const dashboardButton =
    document.getElementById("dashboardButton");

const mobileChatBack =
    document.getElementById("mobileChatBack");

const newMitraButton =
    document.getElementById("newMitraButton");

const sendMessageButton =
    document.getElementById("sendMessageButton");

const sidebarMitraList =
    document.getElementById("sidebarMitraList");

const settingsButton =
    document.getElementById("settingsButton");


const chatMitraName =
    document.getElementById("chatMitraName");

const chatMitraAvatar =
    document.getElementById("chatMitraAvatar");

const chatMitraPersonality =
    document.getElementById("chatMitraPersonality");

const typingAvatar =
    document.getElementById("typingAvatar");

const transparencyMitraName =
    document.getElementById(
        "transparencyMitraName"
    );


// =========================================================
// CURRENT MITRA
// =========================================================

let currentMitra = {

    id: null,

    name: "Mitra",

    identity: "",

    personality: "",

    instructions: ""

};


// =========================================================
// NAVIGATION
// =========================================================

function goToDashboard() {

    window.location.href =
        "dashboard.html";

}


if (dashboardButton) {

    dashboardButton.addEventListener(
        "click",
        goToDashboard
    );

}


if (mobileChatBack) {

    mobileChatBack.addEventListener(
        "click",
        goToDashboard
    );

}


if (newMitraButton) {

    newMitraButton.addEventListener(
        "click",
        function () {

            window.location.href =
                "onboarding.html";

        }
    );

}


if (settingsButton) {

    settingsButton.addEventListener(
        "click",
        function () {

            window.location.href =
                `settings.html?mitra=${mitraId}`;

        }
    );

}


// =========================================================
// UNAUTHORIZED
// =========================================================

function handleUnauthorized() {

    sessionStorage.removeItem(
        "ai_mitra_token"
    );

    window.location.href =
        "index.html";

}


// =========================================================
// TEXTAREA AUTO-GROW
// =========================================================

function resizeMessageInput() {

    messageInput.style.height =
        "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            120
        ) + "px";

}


messageInput.addEventListener(
    "input",
    resizeMessageInput
);


// =========================================================
// ENTER = SEND
// SHIFT + ENTER = NEW LINE
// =========================================================

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            chatForm.requestSubmit();

        }

    }
);


// =========================================================
// CURRENT TIME
// =========================================================

function getCurrentTime() {

    return new Date().toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =========================================================
// SCROLL
// =========================================================

function scrollToBottom(smooth = true) {

    chatMessages.scrollTo({

        top:
            chatMessages.scrollHeight,

        behavior:
            smooth
                ? "smooth"
                : "auto"

    });

}


// =========================================================
// MITRA INITIAL
// =========================================================

function getMitraInitial() {

    if (
        !currentMitra.name ||
        currentMitra.name === "Mitra"
    ) {

        return "✦";

    }


    return currentMitra.name
        .charAt(0)
        .toUpperCase();

}


// =========================================================
// FORMAT PERSONALITY
// =========================================================

function formatPersonality(personality) {

    if (!personality) {

        return "Your AI companion";

    }


    return personality
        .split(",")
        .map(function (trait) {

            return trait.trim();

        })
        .filter(Boolean)
        .join(" · ");

}


// =========================================================
// UPDATE CURRENT MITRA UI
// =========================================================

function updateMitraUI() {

    const name =
        currentMitra.name;

    const initial =
        getMitraInitial();

    const personality =
        formatPersonality(
            currentMitra.personality
        );


    document.title =
        `${name} | AI-Mitra`;


    chatMitraName.textContent =
        name;

    chatMitraAvatar.textContent =
        initial;

    chatMitraPersonality.textContent =
        personality;


    typingAvatar.textContent =
        initial;


    transparencyMitraName.textContent =
        name;


    messageInput.placeholder =
        `Message ${name}...`;

    messageInput.setAttribute(
        "aria-label",
        `Message ${name}`
    );

}


// =========================================================
// SIDEBAR — RENDER ALL MITRAS
// =========================================================

function renderSidebarMitras(mitras) {

    sidebarMitraList.innerHTML =
        "";


    mitras.forEach(
        function (mitra) {

            const id =
                mitra[0];

            const name =
                mitra[1];

            const personality =
                mitra[3];


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "sidebar-mitra";


            if (
                String(id) ===
                String(mitraId)
            ) {

                button.classList.add(
                    "active"
                );

            }


            const avatarWrap =
                document.createElement(
                    "div"
                );

            avatarWrap.className =
                "sidebar-avatar-wrap";


            const avatar =
                document.createElement(
                    "div"
                );

            avatar.className =
                "sidebar-avatar";

            avatar.textContent =
                name
                    ? name
                        .charAt(0)
                        .toUpperCase()
                    : "✦";


            const onlineDot =
                document.createElement(
                    "span"
                );

            onlineDot.className =
                "sidebar-online";


            avatarWrap.appendChild(
                avatar
            );

            avatarWrap.appendChild(
                onlineDot
            );


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "sidebar-mitra-info";


            const nameElement =
                document.createElement(
                    "strong"
                );

            nameElement.textContent =
                name;


            const personalityElement =
                document.createElement(
                    "span"
                );

            personalityElement.textContent =
                formatPersonality(
                    personality
                );


            info.appendChild(
                nameElement
            );

            info.appendChild(
                personalityElement
            );


            button.appendChild(
                avatarWrap
            );

            button.appendChild(
                info
            );


            button.addEventListener(
                "click",
                function () {

                    if (
                        String(id) ===
                        String(mitraId)
                    ) {

                        return;

                    }


                    window.location.href =
                        `chat.html?mitra=${id}`;

                }
            );


            sidebarMitraList.appendChild(
                button
            );

        }
    );

}


// =========================================================
// LOAD ALL MITRAS FOR SIDEBAR
// =========================================================

async function loadSidebarMitras() {

    const response =
        await fetch(
            `${API_BASE_URL}/my-mitras`,
            {
                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }
            }
        );


    if (response.status === 401) {

        handleUnauthorized();

        return;

    }


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Could not load sidebar Mitras."
        );

    }


    renderSidebarMitras(
        data.mitras || []
    );

}


// =========================================================
// CREATE USER MESSAGE
// =========================================================

function addUserMessage(
    message,
    smooth = true
) {

    const row =
        document.createElement("div");

    row.className =
        "message-row user-message";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble user-bubble";

    bubble.textContent =
        message;


    const time =
        document.createElement("span");

    time.className =
        "message-time";

    time.textContent =
        getCurrentTime();


    content.appendChild(
        bubble
    );

    content.appendChild(
        time
    );


    row.appendChild(
        content
    );


    chatMessages.insertBefore(
        row,
        typingIndicator
    );


    scrollToBottom(
        smooth
    );

}


// =========================================================
// CREATE MITRA MESSAGE
// =========================================================

function addMitraMessage(
    message,
    smooth = true
) {

    const row =
        document.createElement("div");

    row.className =
        "message-row nova-message";


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        getMitraInitial();


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const name =
        document.createElement("div");

    name.className =
        "message-name";

    name.textContent =
        currentMitra.name;


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble nova-bubble";

    bubble.textContent =
        message;


    const time =
        document.createElement("span");

    time.className =
        "message-time";

    time.textContent =
        getCurrentTime();


    content.appendChild(
        name
    );

    content.appendChild(
        bubble
    );

    content.appendChild(
        time
    );


    row.appendChild(
        avatar
    );

    row.appendChild(
        content
    );


    chatMessages.insertBefore(
        row,
        typingIndicator
    );


    scrollToBottom(
        smooth
    );

}


// =========================================================
// TYPING
// =========================================================

function showTyping() {

    typingIndicator.style.display =
        "flex";

    scrollToBottom();

}


function hideTyping() {

    typingIndicator.style.display =
        "none";

}


hideTyping();


// =========================================================
// REMOVE EXISTING MESSAGES
// =========================================================

function clearRenderedMessages() {

    const rows =
        chatMessages.querySelectorAll(
            ".message-row:not(.typing-row)"
        );


    rows.forEach(
        function (row) {

            row.remove();

        }
    );

}


// =========================================================
// ADAPTIVE AMBIENCE
// =========================================================

function detectConversationMood(message) {

    const text =
        message.toLowerCase();


    if (
        text.includes("happy") ||
        text.includes("excited") ||
        text.includes("great") ||
        text.includes("amazing") ||
        text.includes("awesome") ||
        text.includes("khush") ||
        text.includes("maza") ||
        text.includes("mast")
    ) {

        return "happy";

    }


    if (
        text.includes("tired") ||
        text.includes("exhausted") ||
        text.includes("thak") ||
        text.includes("low") ||
        text.includes("udaas")
    ) {

        return "calm";

    }


    if (
        text.includes("stress") ||
        text.includes("stressed") ||
        text.includes("pressure") ||
        text.includes("tension") ||
        text.includes("worried") ||
        text.includes("pareshan")
    ) {

        return "quiet";

    }


    return "normal";

}


function applyConversationMood(mood) {

    document.body.classList.remove(
        "mood-happy",
        "mood-calm",
        "mood-quiet"
    );


    if (mood !== "normal") {

        document.body.classList.add(
            `mood-${mood}`
        );

    }

}


// =========================================================
// LOAD SELECTED MITRA
// =========================================================

async function loadMitra() {

    const response =
        await fetch(
            `${API_BASE_URL}/my-mitras/${mitraId}`,
            {
                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }
            }
        );


    if (response.status === 401) {

        handleUnauthorized();

        return false;

    }


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Could not load Mitra."
        );

    }


    const mitra =
        data.mitra;


    currentMitra = {

        id:
            mitra[0],

        name:
            mitra[1],

        identity:
            mitra[2],

        personality:
            mitra[3],

        instructions:
            mitra[4] || ""

    };


    updateMitraUI();


    return true;

}


// =========================================================
// LOAD CONVERSATION HISTORY
// =========================================================

async function loadHistory() {

    const response =
        await fetch(
            `${API_BASE_URL}/my-mitras/${mitraId}/history`,
            {
                method: "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }
            }
        );


    if (response.status === 401) {

        handleUnauthorized();

        return;

    }


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Could not load chat history."
        );

    }


    clearRenderedMessages();


    const history =
        data.history || [];


    history.forEach(
        function (item) {

            if (
                item.role === "user"
            ) {

                addUserMessage(
                    item.message,
                    false
                );

            } else {

                addMitraMessage(
                    item.message,
                    false
                );

            }

        }
    );


    scrollToBottom(
        false
    );

}


// =========================================================
// SEND REAL MESSAGE
// =========================================================

chatForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const message =
            messageInput.value.trim();


        if (!message) {

            return;

        }


        sendMessageButton.disabled =
            true;

        messageInput.disabled =
            true;


        addUserMessage(
            message
        );


        const conversationMood =
            detectConversationMood(
                message
            );

        applyConversationMood(
            conversationMood
        );


        messageInput.value =
            "";

        resizeMessageInput();


        showTyping();


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/my-mitras/${mitraId}/chat`,
                    {
                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify({

                                message:
                                    message

                            })
                    }
                );


            if (response.status === 401) {

                handleUnauthorized();

                return;

            }


            const data =
                await response.json();


            hideTyping();


            if (!response.ok) {

                addMitraMessage(
                    data.detail ||
                    "Something went wrong. Please try again."
                );

                return;

            }


            addMitraMessage(
                data.reply
            );

        }

        catch (error) {

            console.error(
                "Chat Error:",
                error
            );


            hideTyping();


            addMitraMessage(
                "I couldn't connect right now. Please try again."
            );

        }

        finally {

            sendMessageButton.disabled =
                false;

            messageInput.disabled =
                false;

            messageInput.focus();

        }

    }
);


// =========================================================
// INITIAL LOAD
// =========================================================

async function initializeChat() {

    try {

        const mitraLoaded =
            await loadMitra();


        if (!mitraLoaded) {

            return;

        }


        await loadSidebarMitras();

        await loadHistory();


        messageInput.focus();

    }

    catch (error) {

        console.error(
            "Chat initialization error:",
            error
        );


        hideTyping();

    }

}


initializeChat();