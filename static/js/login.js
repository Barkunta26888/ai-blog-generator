document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // 🚨 STOPS PAGE RELOAD

    console.log("Login submitted ✅");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    console.log("Server response:", data);

    if (data.success) {
        localStorage.setItem("user_id", data.user_id);
        window.location.href = "/dashboard"; // 🚀 GOES HERE
    } else {
        document.getElementById("loginMsg").innerText = "Invalid credentials";
    }
});