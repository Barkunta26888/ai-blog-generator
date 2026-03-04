const chatBubble = document.getElementById('ai-chat-bubble');
const chatPanel = document.getElementById('ai-chat-panel');
const chatInput = document.getElementById('ai-chat-input');
const chatMessages = document.getElementById('ai-chat-messages');
const chatSend = document.getElementById('ai-chat-send');

// Toggle panel
chatBubble.addEventListener('click', () => {
    chatPanel.style.display = chatPanel.style.display === 'flex' ? 'none' : 'flex';
    chatPanel.style.flexDirection = 'column';
});

// Send message
chatSend.addEventListener('click', () => {
    const question = chatInput.value.trim();
    if (!question) return;

    // Show user message
    const userMsg = document.createElement('div');
    userMsg.textContent = "You: " + question;
    userMsg.style.marginBottom = "10px";
    chatMessages.appendChild(userMsg);

    // Clear input
    chatInput.value = '';

    // Simulate AI response (replace this with your RAG/LLM API call)
    const aiMsg = document.createElement('div');
    aiMsg.textContent = "AI: Let me generate your answer...";
    aiMsg.style.marginBottom = "10px";
    aiMsg.style.fontWeight = "bold";
    chatMessages.appendChild(aiMsg);

    chatMessages.scrollTop = chatMessages.scrollHeight;
});
