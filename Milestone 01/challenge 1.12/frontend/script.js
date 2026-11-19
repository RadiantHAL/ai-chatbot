// Conversation history (full context maintained across session)
const messages = [];

// Determine backend URL: local development uses port 3000, production uses deployed Render backend
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://ai-chatbot-backend-radianthal.onrender.com';

const chatDisplay = document.getElementById('chatDisplay');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

/**
 * Render a message bubble in the chat display
 */
function renderMessage(role, content, isLoading = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', role);
    if (isLoading) {
        messageDiv.classList.add('loading');
        messageDiv.id = 'loadingBubble';
    }
    messageDiv.textContent = content;
    chatDisplay.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
    return messageDiv;
}

/**
 * Handle sending the message
 */
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || sendBtn.disabled) return;

    // 1. Add user message to state
    messages.push({ role: "user", content: text });

    // 2. Render user bubble
    renderMessage("user", text);

    // 3. Clear input & disable controls while awaiting response
    messageInput.value = "";
    messageInput.disabled = true;
    sendBtn.disabled = true;

    // 4. Render temporary loading bubble
    const loadingBubble = renderMessage("assistant", "Thinking...", true);

    try {
        // 5. Send the FULL conversation history array to your backend /chat route
        const response = await fetch(`${BACKEND_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ messages: messages })
        });

        // Remove loading bubble
        if (loadingBubble && loadingBubble.parentNode) {
            loadingBubble.parentNode.removeChild(loadingBubble);
        }

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error || `Server responded with status ${response.status}`;
            renderMessage("assistant", `⚠️ Error: ${errMsg}`);
            return;
        }

        const data = await response.json();
        const replyText = data.reply || "No reply received.";

        // 6. Append assistant reply to messages state to maintain ongoing context
        messages.push({ role: "assistant", content: replyText });

        // 7. Render assistant message bubble
        renderMessage("assistant", replyText);
    } catch (err) {
        console.error("Failed to communicate with chat backend:", err);
        if (loadingBubble && loadingBubble.parentNode) {
            loadingBubble.parentNode.removeChild(loadingBubble);
        }
        renderMessage("assistant", "⚠️ Could not connect to the backend server. Please verify the backend is running.");
    } finally {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// Event Listeners
sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
