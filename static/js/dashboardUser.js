// 🔐 Get logged-in user ID
const userId = localStorage.getItem("user_id");
console.log("User ID from storage:", userId);

// 🚫 If not logged in, stop
if (!userId) {
    console.error("User ID missing. Redirecting to login.");
    window.location.href = "/login";
} else {
    // ✅ Fetch only this user's blogs
    fetch(`/my-blogs/${userId}`)
        .then(res => res.json())
        .then(data => {
            console.log("Blogs:", data);
        })
        .catch(err => console.error("Fetch error:", err));
}
