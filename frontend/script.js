// =========================================================
// AI-MITRA
// Chapter 10.1 — Real Authentication + JWT
// =========================================================

const API_BASE_URL = "https://ai-mitra-dc74.onrender.com";


// =========================================================
// ELEMENTS
// =========================================================

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");


// =========================================================
// LOGIN / SIGNUP SWITCH
// =========================================================

function showLogin() {

    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");

    loginTab.classList.add("active");
    signupTab.classList.remove("active");

    loginMessage.textContent = "";
    signupMessage.textContent = "";
}


function showSignup() {

    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    signupTab.classList.add("active");
    loginTab.classList.remove("active");

    loginMessage.textContent = "";
    signupMessage.textContent = "";
}


loginTab.addEventListener("click", showLogin);
signupTab.addEventListener("click", showSignup);


// =========================================================
// SHOW / HIDE PASSWORD
// =========================================================

const passwordButtons =
    document.querySelectorAll(".password-toggle");


passwordButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const targetId =
            button.getAttribute("data-target");

        const passwordInput =
            document.getElementById(targetId);


        if (passwordInput.type === "password") {

            passwordInput.type = "text";
            button.textContent = "Hide";

        } else {

            passwordInput.type = "password";
            button.textContent = "Show";

        }

    });

});


// =========================================================
// HELPER — GET BACKEND ERROR
// =========================================================

async function getErrorMessage(response) {

    try {

        const data = await response.json();

        return (
            data.detail ||
            data.message ||
            "Something went wrong."
        );

    } catch (error) {

        return "Something went wrong.";

    }

}


// =========================================================
// REAL LOGIN
// =========================================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("loginPassword")
                .value;


        // -------------------------
        // FRONTEND VALIDATION
        // -------------------------

        if (!email || !password) {

            loginMessage.textContent =
                "Please enter your email and password.";

            return;

        }


        loginMessage.textContent =
            "Signing you in... ✦";


        try {

            // -------------------------
            // CALL FASTAPI
            // -------------------------

            const response = await fetch(
                `${API_BASE_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            // -------------------------
            // LOGIN FAILED
            // -------------------------

            if (!response.ok) {

                const errorMessage =
                    await getErrorMessage(response);

                loginMessage.textContent =
                    errorMessage;

                return;

            }


            // -------------------------
            // LOGIN SUCCESS
            // -------------------------

            const data =
                await response.json();


            if (!data.access_token) {

                loginMessage.textContent =
                    "Login succeeded, but no access token was received.";

                return;

            }


            // -------------------------
            // SAVE JWT
            // -------------------------

            sessionStorage.setItem(
                "ai_mitra_token",
                data.access_token
            );


            loginMessage.textContent =
                "Welcome back ✦";


            // -------------------------
            // OPEN DASHBOARD
            // -------------------------

            setTimeout(function () {

                window.location.href =
                    "dashboard.html";

            }, 500);

        }

        catch (error) {

            console.error(
                "Login error:",
                error
            );


            loginMessage.textContent =
                "Cannot connect to AI-Mitra backend.";

        }

    }
);


// =========================================================
// REAL SIGNUP
// =========================================================

signupForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document
                .getElementById("signupName")
                .value
                .trim();


        const email =
            document
                .getElementById("signupEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("signupPassword")
                .value;


        // -------------------------
        // FRONTEND VALIDATION
        // -------------------------

        if (!name || !email || !password) {

            signupMessage.textContent =
                "Please complete all fields.";

            return;

        }


        if (password.length < 6) {

            signupMessage.textContent =
                "Password must contain at least 6 characters.";

            return;

        }


        signupMessage.textContent =
            "Creating your space... ✦";


        try {

            // -------------------------
            // CALL FASTAPI
            // -------------------------

            const response = await fetch(
                `${API_BASE_URL}/signup`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );


            // -------------------------
            // SIGNUP FAILED
            // -------------------------

            if (!response.ok) {

                const errorMessage =
                    await getErrorMessage(response);

                signupMessage.textContent =
                    errorMessage;

                return;

            }


            // -------------------------
            // SIGNUP SUCCESS
            // -------------------------

            const data =
                await response.json();


            signupMessage.textContent =
                data.message ||
                "Account created successfully ✦";


            // -------------------------
            // PRE-FILL LOGIN EMAIL
            // -------------------------

            document.getElementById(
                "loginEmail"
            ).value = email;


            document.getElementById(
                "loginPassword"
            ).value = "";


            signupForm.reset();


            // -------------------------
            // SWITCH TO LOGIN
            // -------------------------

            setTimeout(function () {

                showLogin();

                loginMessage.textContent =
                    "Account created. Sign in to continue ✦";

            }, 700);

        }

        catch (error) {

            console.error(
                "Signup error:",
                error
            );


            signupMessage.textContent =
                "Cannot connect to AI-Mitra backend.";

        }

    }
);