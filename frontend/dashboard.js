// =========================================================
// AI-MITRA
// Real Multi-Mitra Dashboard + User Logout
// =========================================================

const API_BASE_URL =
    "http://127.0.0.1:8000";


// =========================================================
// ELEMENTS
// =========================================================

const mitraGrid =
    document.getElementById("mitraGrid");

const createMitraTop =
    document.getElementById("createMitraTop");

const createMitraCard =
    document.getElementById("createMitraCard");

const dashboardUser =
    document.getElementById("dashboardUser");

const userDropdown =
    document.getElementById("userDropdown");

const logoutButton =
    document.getElementById("logoutButton");


// =========================================================
// AUTH
// =========================================================

const token =
    sessionStorage.getItem("ai_mitra_token");


if (!token) {

    window.location.href =
        "index.html";

}


// =========================================================
// USER DROPDOWN
// =========================================================

if (
    dashboardUser &&
    userDropdown
) {

    dashboardUser.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            const isOpen =
                userDropdown.style.display ===
                "block";

            userDropdown.style.display =
                isOpen
                    ? "none"
                    : "block";

        }
    );


    document.addEventListener(
        "click",
        function () {

            userDropdown.style.display =
                "none";

        }
    );

}


// =========================================================
// LOGOUT
// =========================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            sessionStorage.removeItem(
                "ai_mitra_token"
            );

            window.location.href =
                "index.html";

        }
    );

}


// =========================================================
// CREATE MITRA NAVIGATION
// =========================================================

function openCreateMitra() {

    window.location.href =
        "onboarding.html";

}


if (createMitraTop) {

    createMitraTop.addEventListener(
        "click",
        openCreateMitra
    );

}


if (createMitraCard) {

    createMitraCard.addEventListener(
        "click",
        openCreateMitra
    );

}


// =========================================================
// HANDLE UNAUTHORIZED
// =========================================================

function handleUnauthorized() {

    sessionStorage.removeItem(
        "ai_mitra_token"
    );

    window.location.href =
        "index.html";

}


// =========================================================
// FORMAT PERSONALITY
// =========================================================

function formatPersonality(personality) {

    if (!personality) {

        return "Your personal AI companion";

    }


    return personality
        .split(",")
        .map(
            function (trait) {

                return trait.trim();

            }
        )
        .filter(Boolean)
        .join(" · ");

}


// =========================================================
// CREATE ONE MITRA CARD
// =========================================================

function createMitraCardElement(mitra) {

    /*
        Backend database row:

        mitra[0] = ID
        mitra[1] = Name
        mitra[2] = Identity
        mitra[3] = Personality
        mitra[4] = Instructions
    */

    const mitraId =
        mitra[0];

    const name =
        mitra[1];

    const identity =
        mitra[2];

    const personality =
        mitra[3];

    const customInstructions =
        mitra[4];


    // =====================================================
    // CARD
    // =====================================================

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "mitra-card";

    card.dataset.mitraId =
        mitraId;


    // =====================================================
    // CARD TOP
    // =====================================================

    const cardTop =
        document.createElement(
            "div"
        );

    cardTop.className =
        "mitra-card-top";


    const avatar =
        document.createElement(
            "div"
        );

    avatar.className =
        "dashboard-mitra-avatar";

    avatar.textContent =
        "✦";


    const onlineDot =
        document.createElement(
            "span"
        );

    onlineDot.className =
        "mitra-online";


    avatar.appendChild(
        onlineDot
    );


    // =====================================================
    // SETTINGS BUTTON
    // =====================================================

    const settingsButton =
        document.createElement(
            "button"
        );

    settingsButton.type =
        "button";

    settingsButton.className =
        "mitra-menu";

    settingsButton.setAttribute(
        "aria-label",
        `Open ${name} settings`
    );

    settingsButton.setAttribute(
        "title",
        "Settings"
    );

    settingsButton.textContent =
        "⚙";


    settingsButton.addEventListener(
        "click",
        function () {

            window.location.href =
                `settings.html?mitra=${mitraId}`;

        }
    );


    cardTop.appendChild(
        avatar
    );

    cardTop.appendChild(
        settingsButton
    );


    // =====================================================
    // MITRA INFO
    // =====================================================

    const info =
        document.createElement(
            "div"
        );

    info.className =
        "mitra-info";


    const nameRow =
        document.createElement(
            "div"
        );

    nameRow.className =
        "mitra-name-row";


    const heading =
        document.createElement(
            "h3"
        );

    heading.textContent =
        name;


    const aiBadge =
        document.createElement(
            "span"
        );

    aiBadge.className =
        "ai-badge";

    aiBadge.textContent =
        "AI Mitra";


    nameRow.appendChild(
        heading
    );

    nameRow.appendChild(
        aiBadge
    );


    const personalityText =
        document.createElement(
            "p"
        );

    personalityText.className =
        "mitra-personality";

    personalityText.textContent =
        formatPersonality(
            personality
        );


    const description =
        document.createElement(
            "p"
        );

    description.className =
        "mitra-description";


    if (customInstructions) {

        description.textContent =
            customInstructions;

    }

    else if (identity) {

        description.textContent =
            `${name} is your ${identity.toLowerCase()} AI companion, created for conversations that feel personal to you.`;

    }

    else {

        description.textContent =
            `${name} is your personal AI companion, created for conversations that feel right for you.`;

    }


    info.appendChild(
        nameRow
    );

    info.appendChild(
        personalityText
    );

    info.appendChild(
        description
    );


    // =====================================================
    // MEMORY HINT
    // =====================================================

    const memoryHint =
        document.createElement(
            "div"
        );

    memoryHint.className =
        "mitra-memory-hint";


    const memoryIcon =
        document.createElement(
            "span"
        );

    memoryIcon.textContent =
        "✦";


    const memoryText =
        document.createElement(
            "p"
        );

    memoryText.textContent =
        "Remembers what matters to you";


    memoryHint.appendChild(
        memoryIcon
    );

    memoryHint.appendChild(
        memoryText
    );


    // =====================================================
    // ACTIONS
    // =====================================================

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "mitra-actions";


    // CONTINUE BUTTON

    const continueButton =
        document.createElement(
            "button"
        );

    continueButton.type =
        "button";

    continueButton.className =
        "continue-button";


    const continueText =
        document.createTextNode(
            "Continue conversation "
        );


    const arrow =
        document.createElement(
            "span"
        );

    arrow.textContent =
        "→";


    continueButton.appendChild(
        continueText
    );

    continueButton.appendChild(
        arrow
    );


    continueButton.addEventListener(
        "click",
        function () {

            window.location.href =
                `chat.html?mitra=${mitraId}`;

        }
    );


    // EDIT BUTTON

    const editButton =
        document.createElement(
            "button"
        );

    editButton.type =
        "button";

    editButton.className =
        "edit-mitra-button";

    editButton.textContent =
        "Edit Mitra";


    editButton.addEventListener(
        "click",
        function () {

            window.location.href =
                `onboarding.html?edit=${mitraId}`;

        }
    );


    actions.appendChild(
        continueButton
    );

    actions.appendChild(
        editButton
    );


    // =====================================================
    // BUILD CARD
    // =====================================================

    card.appendChild(
        cardTop
    );

    card.appendChild(
        info
    );

    card.appendChild(
        memoryHint
    );

    card.appendChild(
        actions
    );


    return card;

}


// =========================================================
// RENDER ALL MITRAS
// =========================================================

function renderMitras(mitras) {

    const oldCards =
        mitraGrid.querySelectorAll(
            ".mitra-card"
        );


    oldCards.forEach(
        function (card) {

            card.remove();

        }
    );


    if (
        !mitras ||
        mitras.length === 0
    ) {

        console.log(
            "No Mitras found."
        );

        return;

    }


    mitras.forEach(
        function (mitra) {

            const card =
                createMitraCardElement(
                    mitra
                );


            mitraGrid.insertBefore(
                card,
                createMitraCard
            );

        }
    );

}


// =========================================================
// LOAD REAL MITRAS
// =========================================================

async function loadMitras() {

    try {

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

            console.error(
                data.detail ||
                "Could not load Mitras."
            );

            return;

        }


        console.log(
            "Real Mitras:",
            data.mitras
        );


        renderMitras(
            data.mitras
        );

    }

    catch (error) {

        console.error(
            "Dashboard API Error:",
            error
        );

    }

}


// =========================================================
// START DASHBOARD
// =========================================================

loadMitras();