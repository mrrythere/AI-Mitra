// =========================================================
// AI-MITRA
// Chapter 10.3 — Real Create / Edit Mitra
// =========================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// =========================================================
// ELEMENTS
// =========================================================

const mitraForm =
    document.getElementById("mitraForm");

const mitraName =
    document.getElementById("mitraName");

const instructions =
    document.getElementById("instructions");

const previewName =
    document.getElementById("previewName");

const previewIdentity =
    document.getElementById("previewIdentity");

const previewTraits =
    document.getElementById("previewTraits");

const previewGreeting =
    document.getElementById("previewGreeting");

const instructionCount =
    document.getElementById("instructionCount");

const backToDashboard =
    document.getElementById("backToDashboard");

const createMessage =
    document.getElementById("createMessage");

const createButtonText =
    document.getElementById("createButtonText");

const submitButton =
    mitraForm.querySelector(".meet-mitra-button");

const identityInputs =
    document.querySelectorAll(
        'input[name="identity"]'
    );

const personalityInputs =
    document.querySelectorAll(
        'input[name="personality"]'
    );


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
// PAGE MODE
// =========================================================

const pageParams =
    new URLSearchParams(
        window.location.search
    );

const editMitraId =
    pageParams.get("edit");

const isEditMode =
    Boolean(editMitraId);


// =========================================================
// AUTH FAILURE
// =========================================================

function handleUnauthorized() {

    sessionStorage.removeItem(
        "ai_mitra_token"
    );

    window.location.href =
        "index.html";

}


// =========================================================
// LIVE NAME PREVIEW
// =========================================================

function updateNamePreview() {

    const name =
        mitraName.value.trim();


    if (name) {

        previewName.textContent =
            name;

        previewGreeting.textContent =
            `Hi 👋 I'm ${name}. I'm looking forward to getting to know you.`;


        if (isEditMode) {

            createButtonText.textContent =
                "Save Changes";

        } else {

            createButtonText.textContent =
                `Meet ${name}`;

        }

    } else {

        previewName.textContent =
            "Your Mitra";

        previewGreeting.textContent =
            "Hi 👋 I'm your Mitra. Give me a name and a personality, and we'll make this space ours.";


        if (isEditMode) {

            createButtonText.textContent =
                "Save Changes";

        } else {

            createButtonText.textContent =
                "Meet your Mitra";

        }

    }

}


mitraName.addEventListener(
    "input",
    updateNamePreview
);


// =========================================================
// LIVE IDENTITY PREVIEW
// =========================================================

function updateIdentityPreview() {

    const selectedIdentity =
        document.querySelector(
            'input[name="identity"]:checked'
        );


    if (!selectedIdentity) {

        previewIdentity.textContent =
            "Choose an identity";

        return;

    }


    if (
        selectedIdentity.value ===
        "Not specified"
    ) {

        previewIdentity.textContent =
            "Identity not specified";

    } else {

        previewIdentity.textContent =
            selectedIdentity.value;

    }

}


identityInputs.forEach(
    function (input) {

        input.addEventListener(
            "change",
            updateIdentityPreview
        );

    }
);


// =========================================================
// LIVE PERSONALITY PREVIEW
// =========================================================

function updatePersonalityPreview() {

    const selected =
        document.querySelectorAll(
            'input[name="personality"]:checked'
        );


    previewTraits.innerHTML = "";


    if (selected.length === 0) {

        const placeholder =
            document.createElement("span");

        placeholder.textContent =
            "Your chosen personality will appear here";

        previewTraits.appendChild(
            placeholder
        );

        return;

    }


    selected.forEach(
        function (item) {

            const trait =
                document.createElement("span");

            trait.textContent =
                item.value;

            previewTraits.appendChild(
                trait
            );

        }
    );

}


personalityInputs.forEach(
    function (input) {

        input.addEventListener(
            "change",
            updatePersonalityPreview
        );

    }
);


// =========================================================
// CHARACTER COUNTER
// =========================================================

function updateInstructionCount() {

    instructionCount.textContent =
        instructions.value.length;

}


instructions.addEventListener(
    "input",
    updateInstructionCount
);


// =========================================================
// BACK TO DASHBOARD
// =========================================================

backToDashboard.addEventListener(
    "click",
    function () {

        window.location.href =
            "dashboard.html";

    }
);


// =========================================================
// LOAD REAL MITRA FOR EDIT MODE
// =========================================================

async function loadMitraForEditing() {

    if (!isEditMode) {
        return;
    }


    createMessage.textContent =
        "Loading your Mitra... ✦";

    submitButton.disabled =
        true;


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/my-mitras/${editMitraId}`,
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

            createMessage.textContent =
                data.detail ||
                "Could not load this Mitra.";

            return;

        }


        // Backend returns database row
        const mitra =
            data.mitra;


        const realMitra = {

            id: mitra[0],

            name:
                mitra[1],

            identity:
                mitra[2],

            personality:
                mitra[3]
                    ? mitra[3]
                        .split(",")
                        .map(
                            item =>
                                item.trim()
                        )
                    : [],

            instructions:
                mitra[4] || ""

        };


        // =================================================
        // PAGE TEXT
        // =================================================

        document.title =
            `Edit ${realMitra.name} | AI-Mitra`;


        const introLabel =
            document.querySelector(
                ".create-label"
            );

        const introHeading =
            document.querySelector(
                ".create-intro h1"
            );

        const introDescription =
            document.querySelector(
                ".create-intro > p:last-child"
            );


        if (introLabel) {

            introLabel.textContent =
                "EDIT YOUR MITRA";

        }


        if (introHeading) {

            introHeading.innerHTML =
                `Make <span>${realMitra.name}</span> feel even more yours.`;

        }


        if (introDescription) {

            introDescription.textContent =
                "Update your Mitra's identity, personality or the way you'd like them to behave with you.";

        }


        // =================================================
        // NAME
        // =================================================

        mitraName.value =
            realMitra.name;


        // =================================================
        // IDENTITY
        // =================================================

        identityInputs.forEach(
            function (input) {

                input.checked =
                    input.value ===
                    realMitra.identity;

            }
        );


        // =================================================
        // PERSONALITY
        // =================================================

        personalityInputs.forEach(
            function (input) {

                input.checked =
                    realMitra.personality.includes(
                        input.value
                    );

            }
        );


        // =================================================
        // INSTRUCTIONS
        // =================================================

        instructions.value =
            realMitra.instructions;


        // =================================================
        // FORM MODE
        // =================================================

        mitraForm.dataset.mode =
            "edit";

        mitraForm.dataset.mitraId =
            realMitra.id;


        // =================================================
        // REFRESH PREVIEW
        // =================================================

        updateNamePreview();
        updateIdentityPreview();
        updatePersonalityPreview();
        updateInstructionCount();


        createMessage.textContent =
            "";

    }

    catch (error) {

        console.error(
            "Load Mitra Error:",
            error
        );


        createMessage.textContent =
            "Could not connect to AI-Mitra.";

    }

    finally {

        submitButton.disabled =
            false;

    }

}


// =========================================================
// FORM SUBMIT
// =========================================================

mitraForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // =================================================
        // COLLECT FORM DATA
        // =================================================

        const name =
            mitraName.value.trim();


        if (!name) {

            createMessage.textContent =
                "Please give your Mitra a name.";

            mitraName.focus();

            return;

        }


        const selectedIdentity =
            document.querySelector(
                'input[name="identity"]:checked'
            );


        if (!selectedIdentity) {

            createMessage.textContent =
                "Please choose an identity.";

            return;

        }


        const identity =
            selectedIdentity.value;


        const personalityElements =
            document.querySelectorAll(
                'input[name="personality"]:checked'
            );


        const personality =
            Array.from(
                personalityElements
            ).map(
                function (item) {

                    return item.value;

                }
            );


        if (personality.length === 0) {

            createMessage.textContent =
                "Choose at least one personality trait.";

            return;

        }


        const customInstructions =
            instructions.value.trim();


        const mitraProfile = {

            name: name,

            identity: identity,

            personality: personality,

            instructions:
                customInstructions

        };


        submitButton.disabled =
            true;


        // =================================================
        // EDIT EXISTING MITRA
        // =================================================

        if (isEditMode) {

            createMessage.textContent =
                "Saving changes... ✦";


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/my-mitras/${editMitraId}`,
                        {
                            method: "PUT",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify(
                                    mitraProfile
                                )
                        }
                    );


                if (response.status === 401) {

                    handleUnauthorized();

                    return;

                }


                const data =
                    await response.json();


                if (!response.ok) {

                    createMessage.textContent =
                        data.detail ||
                        "Could not update your Mitra.";

                    return;

                }


                createMessage.textContent =
                    `${name}'s changes are saved ✦`;


                console.log(
                    "Mitra updated:",
                    data
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "dashboard.html";

                    },
                    700
                );

            }

            catch (error) {

                console.error(
                    "Update Mitra Error:",
                    error
                );


                createMessage.textContent =
                    "Could not connect to AI-Mitra.";

            }

            finally {

                submitButton.disabled =
                    false;

            }


            return;

        }


        // =================================================
        // CREATE NEW MITRA
        // =================================================

        createMessage.textContent =
            "Creating your Mitra... ✦";


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/create-mitra`,
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify(
                                mitraProfile
                            )
                    }
                );


            if (response.status === 401) {

                handleUnauthorized();

                return;

            }


            const data =
                await response.json();


            if (!response.ok) {

                createMessage.textContent =
                    data.detail ||
                    "Could not create your Mitra.";

                return;

            }


            createMessage.textContent =
                `${name} is ready ✦`;


            console.log(
                "Mitra created:",
                data
            );


            setTimeout(
                function () {

                    window.location.href =
                        "dashboard.html";

                },
                700
            );

        }

        catch (error) {

            console.error(
                "Create Mitra Error:",
                error
            );


            createMessage.textContent =
                "Could not connect to AI-Mitra. Is the backend running?";

        }

        finally {

            submitButton.disabled =
                false;

        }

    }
);


// =========================================================
// INITIAL PAGE SETUP
// =========================================================

updateNamePreview();
updateIdentityPreview();
updatePersonalityPreview();
updateInstructionCount();

loadMitraForEditing();


// =========================================================
// DELETE MITRA
// =========================================================

const deleteMitraButton =
    document.getElementById(
        "deleteMitraButton"
    );


if (
    isEditMode &&
    deleteMitraButton
) {

    deleteMitraButton.style.display =
        "block";


    deleteMitraButton.addEventListener(
        "click",
        async function () {

            const mitraDisplayName =
                mitraName.value.trim() ||
                "this Mitra";


            const confirmed =
                window.confirm(
                    `Delete ${mitraDisplayName}?\n\nThis action cannot be undone.`
                );


            if (!confirmed) {

                return;

            }


            deleteMitraButton.disabled =
                true;

            submitButton.disabled =
                true;

            createMessage.textContent =
                `Deleting ${mitraDisplayName}...`;


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/my-mitras/${editMitraId}`,
                        {
                            method: "DELETE",

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

                    createMessage.textContent =
                        data.detail ||
                        "Could not delete this Mitra.";

                    return;

                }


                createMessage.textContent =
                    `${mitraDisplayName} deleted.`;


                setTimeout(
                    function () {

                        window.location.href =
                            "dashboard.html";

                    },
                    500
                );

            }

            catch (error) {

                console.error(
                    "Delete Mitra Error:",
                    error
                );


                createMessage.textContent =
                    "Could not connect to AI-Mitra.";

            }

            finally {

                deleteMitraButton.disabled =
                    false;

                submitButton.disabled =
                    false;

            }

        }
    );

}