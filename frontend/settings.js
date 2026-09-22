// =========================================================
// AI-MITRA
// Chapter 10 — Real Settings + Memory Integration
// =========================================================


const API_BASE_URL =
    "http://127.0.0.1:8000";


// =========================================================
// AUTH + SELECTED MITRA
// =========================================================

const token =
    sessionStorage.getItem(
        "ai_mitra_token"
    );


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

const backToChat =
    document.getElementById(
        "backToChat"
    );


const editMitraButton =
    document.getElementById(
        "editMitraButton"
    );


const introMitraName =
    document.getElementById(
        "introMitraName"
    );


const profileMitraName =
    document.getElementById(
        "profileMitraName"
    );


const profileMitraAvatar =
    document.getElementById(
        "profileMitraAvatar"
    );


const profileMitraIdentity =
    document.getElementById(
        "profileMitraIdentity"
    );


const profileMitraPersonality =
    document.getElementById(
        "profileMitraPersonality"
    );


const memoryMitraName =
    document.getElementById(
        "memoryMitraName"
    );


const memoryList =
    document.getElementById(
        "memoryList"
    );


const memoryCount =
    document.getElementById(
        "memoryCount"
    );


const memoryEmptyState =
    document.getElementById(
        "memoryEmptyState"
    );


const memoryMessage =
    document.getElementById(
        "memoryMessage"
    );


const memoryModal =
    document.getElementById(
        "memoryModal"
    );


const closeMemoryModal =
    document.getElementById(
        "closeMemoryModal"
    );


const cancelMemoryEdit =
    document.getElementById(
        "cancelMemoryEdit"
    );


const saveMemoryEdit =
    document.getElementById(
        "saveMemoryEdit"
    );


const memoryEditInput =
    document.getElementById(
        "memoryEditInput"
    );


const ambienceToggle =
    document.getElementById(
        "ambienceToggle"
    );


const animationToggle =
    document.getElementById(
        "animationToggle"
    );


const settingsStatus =
    document.getElementById(
        "settingsStatus"
    );



// =========================================================
// STATE
// =========================================================

let currentMitra = null;

let activeMemoryKey = null;



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
// NAVIGATION
// =========================================================

backToChat.addEventListener(
    "click",
    function () {

        window.location.href =
            `chat.html?mitra=${mitraId}`;

    }
);



editMitraButton.addEventListener(
    "click",
    function () {

        window.location.href =
            `onboarding.html?edit=${mitraId}`;

    }
);



// =========================================================
// FORMAT PERSONALITY
// =========================================================

function formatPersonality(
    personality
) {

    if (!personality) {

        return "Your AI companion";

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
// FORMAT MEMORY KEY
// =========================================================

function formatMemoryKey(key) {

    if (!key) {

        return "Memory";

    }


    return key
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            function (letter) {

                return letter.toUpperCase();

            }
        );

}



// =========================================================
// MEMORY ICON
// =========================================================

function getMemoryIcon(key) {

    const normalizedKey =
        (key || "").toLowerCase();


    if (
        normalizedKey.includes("bike") ||
        normalizedKey.includes("motorcycle")
    ) {

        return "🏍️";

    }


    if (
        normalizedKey.includes("programming") ||
        normalizedKey.includes("coding") ||
        normalizedKey.includes("language")
    ) {

        return "💻";

    }


    if (
        normalizedKey.includes("food")
    ) {

        return "🍽️";

    }


    if (
        normalizedKey.includes("music") ||
        normalizedKey.includes("song")
    ) {

        return "🎵";

    }


    if (
        normalizedKey.includes("game")
    ) {

        return "🎮";

    }


    if (
        normalizedKey.includes("career") ||
        normalizedKey.includes("goal")
    ) {

        return "🎯";

    }


    return "✦";

}



// =========================================================
// LOAD MITRA PROFILE
// =========================================================

async function loadMitra() {

    const response =
        await fetch(
            `${API_BASE_URL}/my-mitras/${mitraId}`,
            {

                method:
                    "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


    if (
        response.status === 401
    ) {

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
// UPDATE MITRA UI
// =========================================================

function updateMitraUI() {

    const name =
        currentMitra.name ||
        "Mitra";


    const initial =
        name
            .charAt(0)
            .toUpperCase();


    const personality =
        formatPersonality(
            currentMitra.personality
        );


    document.title =
        `${name} Settings | AI-Mitra`;


    backToChat.textContent =
        `← Back to ${name}`;


    introMitraName.textContent =
        name;


    profileMitraName.textContent =
        name;


    profileMitraAvatar.textContent =
        initial;


    profileMitraIdentity.textContent =
        currentMitra.identity ||
        "AI companion";


    profileMitraPersonality.textContent =
        personality;


    memoryMitraName.textContent =
        name;


    editMitraButton.textContent =
        `Edit ${name}`;

}



// =========================================================
// MEMORY COUNT
// =========================================================

function updateMemoryCount() {

    const memories =
        memoryList.querySelectorAll(
            ".memory-item"
        );


    memoryCount.textContent =
        memories.length;


    if (
        memories.length === 0
    ) {

        memoryEmptyState.hidden =
            false;

    } else {

        memoryEmptyState.hidden =
            true;

    }

}



// =========================================================
// CREATE MEMORY CARD
// =========================================================

function createMemoryCard(memory) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "memory-item";


    article.dataset.memoryKey =
        memory.key;



    const icon =
        document.createElement(
            "div"
        );


    icon.className =
        "memory-icon";


    icon.textContent =
        getMemoryIcon(
            memory.key
        );



    const information =
        document.createElement(
            "div"
        );


    information.className =
        "memory-information";



    const label =
        document.createElement(
            "span"
        );


    label.className =
        "memory-label";


    label.textContent =
        formatMemoryKey(
            memory.key
        );



    const value =
        document.createElement(
            "strong"
        );


    value.className =
        "memory-value";


    value.textContent =
        memory.value;



    information.appendChild(
        label
    );


    information.appendChild(
        value
    );



    const actions =
        document.createElement(
            "div"
        );


    actions.className =
        "memory-actions";



    const editButton =
        document.createElement(
            "button"
        );


    editButton.className =
        "memory-action edit-memory";


    editButton.type =
        "button";


    editButton.textContent =
        "Edit";



    const deleteButton =
        document.createElement(
            "button"
        );


    deleteButton.className =
        "memory-action delete-memory";


    deleteButton.type =
        "button";


    deleteButton.textContent =
        "Delete";



    actions.appendChild(
        editButton
    );


    actions.appendChild(
        deleteButton
    );



    article.appendChild(
        icon
    );


    article.appendChild(
        information
    );


    article.appendChild(
        actions
    );


    return article;

}



// =========================================================
// LOAD REAL MEMORIES
// =========================================================

async function loadMemories() {

    memoryMessage.textContent =
        "";


    const response =
        await fetch(
            `${API_BASE_URL}/my-mitras/${mitraId}/memories`,
            {

                method:
                    "GET",

                headers: {

                    "Authorization":
                        `Bearer ${token}`

                }

            }
        );


    if (
        response.status === 401
    ) {

        handleUnauthorized();

        return;

    }


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.detail ||
            "Could not load memories."
        );

    }


    memoryList.innerHTML =
        "";


    const memories =
        data.memories || [];


    memories.forEach(
        function (memory) {

            const card =
                createMemoryCard(
                    memory
                );


            memoryList.appendChild(
                card
            );

        }
    );


    updateMemoryCount();

}



// =========================================================
// OPEN MEMORY EDITOR
// =========================================================

function openMemoryEditor(
    memoryItem
) {

    activeMemoryKey =
        memoryItem.dataset.memoryKey;


    const value =
        memoryItem.querySelector(
            ".memory-value"
        );


    memoryEditInput.value =
        value.textContent.trim();


    memoryModal.hidden =
        false;


    document.body.classList.add(
        "memory-modal-open"
    );


    setTimeout(
        function () {

            memoryEditInput.focus();

            memoryEditInput.select();

        },
        50
    );

}



// =========================================================
// CLOSE MEMORY EDITOR
// =========================================================

function closeMemoryEditor() {

    memoryModal.hidden =
        true;


    document.body.classList.remove(
        "memory-modal-open"
    );


    activeMemoryKey =
        null;

}



// =========================================================
// MEMORY BUTTONS
// =========================================================

memoryList.addEventListener(
    "click",
    async function (event) {

        const memoryItem =
            event.target.closest(
                ".memory-item"
            );


        if (!memoryItem) {

            return;

        }


        // EDIT

        if (
            event.target.classList.contains(
                "edit-memory"
            )
        ) {

            openMemoryEditor(
                memoryItem
            );

            return;

        }


        // DELETE

        if (
            event.target.classList.contains(
                "delete-memory"
            )
        ) {

            const memoryKey =
                memoryItem.dataset.memoryKey;


            const memoryName =
                memoryItem
                    .querySelector(
                        ".memory-label"
                    )
                    .textContent
                    .trim();


            const confirmed =
                window.confirm(
                    `Delete "${memoryName}"?`
                );


            if (!confirmed) {

                return;

            }


            event.target.disabled =
                true;


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/my-mitras/${mitraId}/memories/${encodeURIComponent(memoryKey)}`,
                        {

                            method:
                                "DELETE",

                            headers: {

                                "Authorization":
                                    `Bearer ${token}`

                            }

                        }
                    );


                if (
                    response.status ===
                    401
                ) {

                    handleUnauthorized();

                    return;

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.detail ||
                        "Could not delete memory."
                    );

                }


                memoryItem.remove();


                updateMemoryCount();


                memoryMessage.textContent =
                    `${memoryName} removed from long-term memory.`;

            }

            catch (error) {

                console.error(
                    "Delete memory error:",
                    error
                );


                memoryMessage.textContent =
                    error.message;


                event.target.disabled =
                    false;

            }

        }

    }
);



// =========================================================
// SAVE REAL MEMORY EDIT
// =========================================================

saveMemoryEdit.addEventListener(
    "click",
    async function () {

        if (!activeMemoryKey) {

            return;

        }


        const newValue =
            memoryEditInput
                .value
                .trim();


        if (!newValue) {

            memoryEditInput.focus();

            return;

        }


        const memoryKey =
            activeMemoryKey;


        saveMemoryEdit.disabled =
            true;


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/my-mitras/${mitraId}/memories/${encodeURIComponent(memoryKey)}`,
                    {

                        method:
                            "PUT",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify(
                                {

                                    value:
                                        newValue

                                }
                            )

                    }
                );


            if (
                response.status ===
                401
            ) {

                handleUnauthorized();

                return;

            }


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.detail ||
                    "Could not update memory."
                );

            }


            closeMemoryEditor();


            await loadMemories();


            memoryMessage.textContent =
                "Memory updated successfully ✦";

        }

        catch (error) {

            console.error(
                "Update memory error:",
                error
            );


            memoryMessage.textContent =
                error.message;

        }

        finally {

            saveMemoryEdit.disabled =
                false;

        }

    }
);



// =========================================================
// MODAL CONTROLS
// =========================================================

closeMemoryModal.addEventListener(
    "click",
    closeMemoryEditor
);


cancelMemoryEdit.addEventListener(
    "click",
    closeMemoryEditor
);


memoryModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            memoryModal
        ) {

            closeMemoryEditor();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            !memoryModal.hidden
        ) {

            closeMemoryEditor();

        }

    }
);


memoryEditInput.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            saveMemoryEdit.click();

        }

    }
);



// =========================================================
// EXPERIENCE SETTINGS
// =========================================================

function loadExperienceSettings() {

    const ambienceSetting =
        localStorage.getItem(
            "ai_mitra_ambience"
        );


    const animationSetting =
        localStorage.getItem(
            "ai_mitra_animations"
        );


    if (
        ambienceSetting !== null
    ) {

        ambienceToggle.checked =
            ambienceSetting ===
            "true";

    }


    if (
        animationSetting !== null
    ) {

        animationToggle.checked =
            animationSetting ===
            "true";

    }


    if (
        !animationToggle.checked
    ) {

        document.body.classList.add(
            "animations-disabled"
        );

    }

}



ambienceToggle.addEventListener(
    "change",
    function () {

        localStorage.setItem(
            "ai_mitra_ambience",
            String(
                ambienceToggle.checked
            )
        );


        if (
            ambienceToggle.checked
        ) {

            settingsStatus.textContent =
                "Adaptive ambience enabled ✦";

        } else {

            settingsStatus.textContent =
                "Adaptive ambience disabled";

        }

    }
);



animationToggle.addEventListener(
    "change",
    function () {

        localStorage.setItem(
            "ai_mitra_animations",
            String(
                animationToggle.checked
            )
        );


        if (
            animationToggle.checked
        ) {

            document.body.classList.remove(
                "animations-disabled"
            );


            settingsStatus.textContent =
                "Gentle animations enabled ✦";

        } else {

            document.body.classList.add(
                "animations-disabled"
            );


            settingsStatus.textContent =
                "Gentle animations disabled";

        }

    }
);



// =========================================================
// INITIALIZE
// =========================================================

async function initializeSettings() {

    try {

        loadExperienceSettings();


        const loaded =
            await loadMitra();


        if (!loaded) {

            return;

        }


        await loadMemories();


        settingsStatus.textContent =
            `${currentMitra.name} settings connected ✦`;

    }

    catch (error) {

        console.error(
            "Settings initialization error:",
            error
        );


        memoryMessage.textContent =
            error.message ||
            "Could not load settings.";


        settingsStatus.textContent =
            "Could not connect settings";

    }

}



initializeSettings();