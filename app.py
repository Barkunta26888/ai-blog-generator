from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
import sqlite3
import uuid
import os
from werkzeug.security import generate_password_hash, check_password_hash
from groq import Groq
from fpdf import FPDF
from datetime import datetime

# ---------------- APP SETUP ----------------
app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)
app.secret_key = "supersecretkey"

# ---------------- GROQ CLIENT ----------------
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ---------------- DATABASE ----------------
def get_db_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blogs (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            topic TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)

    conn.commit()
    conn.close()


init_db()

# ---------------- SIGNUP ----------------
@app.route("/api/signup", methods=["POST"])
def api_signup():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"success": False, "message": "Invalid input"}), 400

    try:
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            (data["email"], generate_password_hash(data["password"]))
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True})
    except sqlite3.IntegrityError:
        return jsonify({"success": False, "message": "Email already exists"}), 400


# ---------------- LOGIN ----------------
@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json()

    if not data or "email" not in data or "password" not in data:
        return jsonify({"success": False}), 400

    conn = get_db_connection()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (data["email"],)
    ).fetchone()
    conn.close()

    if user and check_password_hash(user["password"], data["password"]):
        return jsonify({"success": True, "user_id": user["id"]})

    return jsonify({"success": False}), 401


# ---------------- BLOG GENERATOR ----------------
# ---------------- BLOG GENERATOR ----------------
# ---------------- BLOG GENERATOR ----------------
@app.route("/api/generate-blog", methods=["POST"])
def generate_blog():
    data = request.get_json()

    required_fields = ["company", "tone", "language", "topic", "word_count", "user_id"]
    if not all(field in data for field in required_fields):
        return jsonify({"success": False, "error": "Missing required fields"}), 400

    prompt = f"""
You are a professional SEO blog writer.

Write a professional blog using STRICT formatting rules below:

FORMAT RULES:
1. Do NOT use markdown symbols like ** or ##.
2. Use ONLY these section headings in UPPERCASE:

INTRODUCTION
BODY
CONCLUSION

3. Leave one blank line after each heading.
4. Write long, meaningful, professional sentences.
5. But ensure each paragraph is readable and not overly long.
6. Stop writing when the word count is approximately {data['word_count']} words.
7. Do not exceed the word count significantly.
8. Use proper paragraph spacing.
9. Inside BODY, divide content using sub-headings written in CAPITAL LETTERS without symbols.
10. Do not use asterisks, hashtags, or markdown formatting.

DETAILS:
Company: {data['company']}
Tone: {data['tone']}
Language: {data['language']}
Main Topic: {data['topic']}

The blog must look clean and professional when displayed as plain text.
"""

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=1400
        )

        result = completion.choices[0].message.content

        # Extra cleanup to remove unwanted symbols automatically
        result = result.replace("**", "")
        result = result.replace("##", "")
        result = result.replace("#", "")

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    blog_id = str(uuid.uuid4())

    try:
        conn = get_db_connection()
        conn.execute(
            "INSERT INTO blogs (id, user_id, topic, content) VALUES (?, ?, ?, ?)",
            (blog_id, int(data["user_id"]), data["topic"], result)
        )
        conn.commit()
        conn.close()
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    return jsonify({
        "success": True,
        "blog": {
            "id": blog_id,
            "content": result
        }
    })

# ---------------- PDF EXPORT ----------------
@app.route("/api/export-pdf/<blog_id>")
def export_pdf(blog_id):
    conn = get_db_connection()
    blog = conn.execute(
        "SELECT * FROM blogs WHERE id = ?",
        (blog_id,)
    ).fetchone()
    conn.close()

    if not blog:
        return "Blog not found", 404

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=10)
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    for line in blog["content"].split("\n"):
        pdf.multi_cell(0, 8, line)

    filename = f"blog_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    pdf.output(filename)

    return send_file(filename, as_attachment=True)


# ---------------- HISTORY ----------------
@app.route("/api/history/<int:user_id>")
def history(user_id):
    conn = get_db_connection()
    blogs = conn.execute(
        "SELECT * FROM blogs WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()
    conn.close()

    return jsonify([dict(b) for b in blogs])


# ---------------- PAGES ----------------
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/signup")
def signup_page():
    return render_template("signup.html")

@app.route("/dashboard")
def dashboard_page():
    return render_template("dashboard.html")

@app.route("/blog-generator")
def blog_generator_page():
    return render_template("blog_generator.html")


# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)