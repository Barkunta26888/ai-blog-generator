// Strong Password Pattern
let passwordPattern =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/;

/* ==========================
        SIGNUP FUNCTION
========================== */
function signup() {

    // ✅ Get elements only when signup page loads
    let signupEmail = document.getElementById("signupEmail");
    let signupPassword = document.getElementById("signupPassword");
    let signupMsg = document.getElementById("signupMsg");

    const email = signupEmail.value.trim();
    const password = signupPassword.value.trim();

    signupMsg.className = "msg";

    if (!email || !password) {
        signupMsg.innerHTML = "❌ Please fill all fields.";
        signupMsg.classList.add("error");
        return;
    }

    if (!email.endsWith("@gmail.com")) {
        signupMsg.innerHTML = "❌ Email must end with @gmail.com.";
        signupMsg.classList.add("error");
        return;
    }

    if (!passwordPattern.test(password)) {
        signupMsg.innerHTML =
            "❌ Password must be 8+ chars with 1 Capital, 1 Number & 1 Special symbol.";
        signupMsg.classList.add("error");
        return;
    }

    // ✅ Save user
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);

    signupMsg.innerHTML = "✅ Account created successfully! Redirecting...";
    signupMsg.classList.add("success");

    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);
}

/* ==========================
        LOGIN FUNCTION
========================== */
function login() {

    // ✅ Get elements only when login page loads
    let loginEmail = document.getElementById("loginEmail");
    let loginPassword = document.getElementById("loginPassword");
    let loginMsg = document.getElementById("loginMsg");

    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    loginMsg.className = "msg";

    if (
        email === localStorage.getItem("email") &&
        password === localStorage.getItem("password")
    ) {
        // Save logged in user
        localStorage.setItem("loggedInUser", email);

        loginMsg.innerHTML = "✅ Login successful! Redirecting...";
        loginMsg.classList.add("success");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
    } else {
        loginMsg.innerHTML = "❌ Invalid email or password.";
        loginMsg.classList.add("error");
    }
}
