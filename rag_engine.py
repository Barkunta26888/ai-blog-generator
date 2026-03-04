import os
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import ollama

# =====================================================
# 🔹 Load Embedding Model (ONLY ONCE – CPU SAFE)
# =====================================================

_embed_model = None

def get_embed_model():
    global _embed_model
    if _embed_model is None:
        _embed_model = SentenceTransformer(
            "sentence-transformers/all-MiniLM-L6-v2",
            device="cpu"
        )
    return _embed_model


# =====================================================
# 🔹 Load Company Knowledge
# =====================================================

def load_docs(company_name):
    folder = "knowledge"
    filename = f"{company_name.lower()}.txt"
    filepath = os.path.join(folder, filename)

    if not os.path.exists(filepath):
        return ["No company-specific knowledge found. Generate a general company blog."]

    with open(filepath, "r", encoding="utf-8") as f:
        return [f.read()]


# =====================================================
# 🔹 MAIN RAG BLOG GENERATOR (ONLY ONE FUNCTION)
# =====================================================

def generate_blog_rag(company_name, topic, tone, emotion):

    embed_model = get_embed_model()

    # Step 1: Load documents
    docs = load_docs(company_name)

    # Step 2: Create embeddings
    doc_embeddings = embed_model.encode(docs)
    dimension = doc_embeddings.shape[1]

    # Step 3: Create FAISS index
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(doc_embeddings))

    # Step 4: Retrieve context
    query_embedding = embed_model.encode([topic])
    _, indices = index.search(np.array(query_embedding), k=1)

    retrieved_context = docs[indices[0][0]]

    # Step 5: Prompt
    prompt = f"""
You are a professional corporate blog writer working for the company: {company_name}.

==============================
Writing Rules
==============================
- Tone: {tone}
- Emotion style: {emotion}
- Business-focused, professional
- Avoid generic content
- Mention {company_name} naturally

==============================
Topic
==============================
{topic}

==============================
Company Knowledge
==============================
{retrieved_context}

==============================
Structure
==============================
1. Catchy Title (Company Style)
2. Introduction (mention {company_name})
3. Why this topic matters
4. How {company_name} solves this using AI + RAG
5. Use cases
6. Benefits
7. Future vision
8. Conclusion

Write at least 1200 words.
Use proper headings.
"""

    # Step 6: Ollama LLM
    response = ollama.chat(
        model="tinyllama",
        messages=[{"role": "user", "content": prompt}]
    )

    return response["message"]["content"]
