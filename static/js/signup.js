async function signup() {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const msg = document.getElementById("signupMsg");

    if (!email || !password) {
        msg.innerText = "Please fill all fields";
        msg.style.color = "red";
        return;
    }

    try {
        const res = await fetch("/api/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        msg.innerText = data.message;
        msg.style.color = "green";

        if (res.ok) {
            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);
        }

    } catch (err) {
        msg.innerText = "Server error";
        msg.style.color = "red";
        console.error(err);
    }
}