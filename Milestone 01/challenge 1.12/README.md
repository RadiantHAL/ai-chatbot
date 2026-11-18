# AI Chatbot

## What I Built
A minimal, production-grade AI chatbot featuring a Node.js Express backend proxy and a responsive vanilla JavaScript frontend. The chatbot maintains continuous multi-turn conversation context across the session by transmitting the complete message history array to the backend on each user interaction.

---

## Technical Questions & Answers

### Question 1 — API and Model
- **API:** OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`)
- **Model:** `openai/gpt-4o-mini`

### Question 2 — Why Backend Not Frontend
- **Why backend only:** Frontend JavaScript is delivered directly to the client browser, meaning any API key stored or called in client code can be instantly inspected, extracted, and stolen by anyone opening browser DevTools (Network tab, source files, or console). Keeping the API key on the backend Express server keeps the secret strictly server-side, protecting against unauthorized API key theft, malicious quota exhaustion, and billing fraud.

### Question 3 — Fallback Provider
- **Fallback provider:** Google Gemini API (free tier via Google AI Studio).
- **Two things that change in code:**
  1. **Base API URL:** Change the endpoint URL from `https://openrouter.ai/api/v1/chat/completions` to `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`.
  2. **Model Name:** Change the model parameter string from `openai/gpt-4o-mini` to `gemini-1.5-flash`.

---

## Live Deployment

- **Frontend:** [https://ai-chatbot-radianthal.netlify.app](https://ai-chatbot-radianthal.netlify.app)
- **Backend:** [https://ai-chatbot-backend-radianthal.onrender.com](https://ai-chatbot-backend-radianthal.onrender.com)
- **Backend Health Check:** [https://ai-chatbot-backend-radianthal.onrender.com/health](https://ai-chatbot-backend-radianthal.onrender.com/health)

---

## Architecture

```
User (Browser)
    │
    ▼
Frontend (index.html, script.js)
    │  POST /chat { messages: [...] }
    │  (No API keys in client code)
    ▼
Backend (Node.js Express on port 3000)
    │  Reads process.env.OPENROUTER_API_KEY
    │  Injects Authorization header
    ▼
OpenRouter API / Gemini API
    │
    ▼
Response returned to Backend ──► Response returned to Frontend
```

---

## Local Development Setup

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and supply your OPENROUTER_API_KEY
npm start
```
The server will start on `http://localhost:3000`.

### 2. Frontend Setup
Open `frontend/index.html` directly in your browser or run a local HTTP server:
```bash
# From repository root or frontend directory:
npx serve frontend
```
Or open `frontend/index.html` in VS Code with Live Server.

---

## Context Verification Test

To verify conversation memory:
1. **Message 1:** `"What is JavaScript?"` &rarr; Model explains JavaScript.
2. **Message 2:** `"Can you give me an example of that?"` &rarr; Model provides a JavaScript code snippet without needing to re-specify what "that" refers to.
