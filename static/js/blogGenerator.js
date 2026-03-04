// ================= TAB SWITCH =================
function showTab(tabName) {

    document.getElementById("setupTab").classList.add("hidden");
    document.getElementById("previewTab").classList.add("hidden");
    document.getElementById("historyTab").classList.add("hidden");

    if (tabName === "setup") {
        document.getElementById("setupTab").classList.remove("hidden");
    }

    if (tabName === "preview") {
        document.getElementById("previewTab").classList.remove("hidden");
    }

    if (tabName === "history") {
        document.getElementById("historyTab").classList.remove("hidden");
        loadHistory();
    }
}


// ================= GENERATE BLOG =================
document.addEventListener("DOMContentLoaded", () => {

    const generateBtn = document.getElementById("generateBlogBtn");

    generateBtn.addEventListener("click", async () => {

        const topic = document.getElementById("topic").value.trim();
        const wordCount = Number(document.getElementById("wordCount").value);
        const tone = document.getElementById("tone").value;
        const language = document.getElementById("language").value;
        const company = document.getElementById("company").value.trim();
        const userId = localStorage.getItem("user_id");

        if (!userId) {
            alert("User not logged in.");
            return;
        }

        if (!topic || !company) {
            alert("Please fill all fields.");
            return;
        }

        try {

            const response = await fetch("/api/generate-blog", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    topic: topic,
                    word_count: wordCount,
                    tone: tone,
                    language: language,
                    company: company,
                    user_id: userId
                })
            });

            const data = await response.json();

            if (data.success) {

                // Save blog ID for export
                localStorage.setItem("current_blog_id", data.blog.id);

                document.getElementById("previewContent").innerHTML =
                    `<pre>${data.blog.content}</pre>`;

                showTab("preview");

            } else {
                alert("Error: " + data.error);
            }

        } catch (error) {
            alert("Server error. Check backend.");
        }

    });

});


// ================= EXPORT PDF =================
function exportPDF() {

    const blogId = localStorage.getItem("current_blog_id");

    if (!blogId) {
        alert("No blog available.");
        return;
    }

    window.location.href = `/api/export-pdf/${blogId}`;
}


// ================= LOAD HISTORY =================
async function loadHistory() {

    const userId = localStorage.getItem("user_id");

    if (!userId) return;

    const response = await fetch(`/api/history/${userId}`);
    const blogs = await response.json();

    const historyDiv = document.getElementById("historyList");

    if (blogs.length === 0) {
        historyDiv.innerHTML = "No history yet.";
        return;
    }

    historyDiv.innerHTML = "";

    blogs.forEach(blog => {

        const div = document.createElement("div");
        div.className = "history-item";
        div.innerText = blog.topic;

        div.onclick = () => {

            document.getElementById("previewContent").innerHTML =
                `<pre>${blog.content}</pre>`;

            localStorage.setItem("current_blog_id", blog.id);

            showTab("preview");
        };

        historyDiv.appendChild(div);

    });
}