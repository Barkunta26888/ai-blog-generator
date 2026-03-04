function showSection(id) {
    document.querySelectorAll(".section").forEach(sec =>
        sec.classList.remove("active")
    );
    document.getElementById(id).classList.add("active");
}

function logout() {
    // ✅ Remove logged-in user session
    localStorage.removeItem("loggedInUser");

    // Redirect to home page
    window.location.href = "index.html";
}
window.onload = function () {
    let user = localStorage.getItem("loggedInUser");

    if (user) {
        // Show email
        document.getElementById("userEmail").innerText = user;

        // Show first letter in avatar
        document.getElementById("avatarLetter").innerText =
            user.charAt(0).toUpperCase();
    }
};
