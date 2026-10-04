const API_URL = "http://localhost:5000/api/auth";


// =============================
// REGISTER
// =============================

const registerForm =
    document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById("message");

            try {

                const response = await fetch(
                    `${API_URL}/register`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            email,
                            password
                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {

                    message.textContent =
                        data.message;

                    return;
                }

                message.style.color = "green";

                message.textContent =
                    "Registration successful!";

                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1000);

            } catch (error) {

                console.error(error);

                message.textContent =
                    "Backend connection failed.";

            }

        }
    );

}


// =============================
// LOGIN
// =============================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            const message =
                document.getElementById("message");

            try {

                const response = await fetch(
                    `${API_URL}/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            email,
                            password
                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {

                    message.textContent =
                        data.message;

                    return;
                }

                // Save JWT token
                localStorage.setItem(
                    "token",
                    data.token
                );

                // Save user information
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                message.style.color = "green";

                message.textContent =
                    "Login successful!";

                setTimeout(() => {

                    window.location.href =
                        "index.html";

                }, 500);

            } catch (error) {

                console.error(error);

                message.textContent =
                    "Backend connection failed.";

            }

        }
    );

}