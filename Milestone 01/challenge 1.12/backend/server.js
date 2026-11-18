const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Initialize dotenv at the top
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static frontend files if hosted together
app.use(express.static('../frontend'));

// Health check route to verify server status
app.get('/health', (req, res) => {
  res.json({ status: "ok", service: "ai-chatbot-backend" });
});

/**
 * AI Chat Route
 * Accepts full conversation history from the frontend,
 * securely proxies request to AI provider using server-side API key,
 * and returns the AI assistant response.
 */
app.post('/chat', async (req, res) => {
  try {
    // 1. Extract messages array from request body
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Invalid request: 'messages' array is required."
      });
    }

    // 2. Read API key from environment variables (Primary: OpenRouter, Fallback: Gemini)
    let apiKey = process.env.OPENROUTER_API_KEY;
    let apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    let modelName = process.env.AI_MODEL || "openai/gpt-4o-mini";

    // Check for fallback provider if OpenRouter key is not set
    if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
        apiKey = process.env.GEMINI_API_KEY;
        apiUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        modelName = "gemini-1.5-flash";
        console.log("Using fallback provider: Google Gemini");
      } else {
        return res.status(500).json({
          error: "API key is not configured. Please set OPENROUTER_API_KEY in backend/.env"
        });
      }
    } else {
      console.log(`Using primary provider: OpenRouter (${modelName})`);
    }

    // 3. Forward full message history to AI completion API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/RadiantHAL/ai-chatbot",
        "X-Title": "AI Chatbot"
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API request failed [${response.status}]:`, errorText);
      return res.status(response.status).json({
        error: `AI Provider responded with status ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();

    // 4. Extract reply content and return to frontend
    const reply = data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : "I received an empty response from the model.";

    return res.json({ reply });
  } catch (error) {
    console.error("Error processing /chat request:", error);
    return res.status(500).json({
      error: "Internal server error while communicating with AI provider.",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
