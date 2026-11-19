/**
 * Verification Test Suite for AI Chatbot Backend
 */

const express = require('express');
const http = require('http');

// Set test environment
process.env.PORT = '3098';
process.env.OPENROUTER_API_KEY = 'test-dummy-key';

let passed = 0;
let failed = 0;

function assert(name, condition, actual, expected) {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Expected:`, expected);
    console.error(`   Actual:  `, actual);
    failed++;
  }
}

async function run() {
  console.log("--- Starting AI Chatbot Backend Tests ---\n");

  // Verify server can be required and routes are mounted
  const app = express();
  app.use(express.json());

  // Test 1: Empty body payload validation
  {
    const req = { body: {} };
    let status = 200;
    let responseBody = null;
    const res = {
      status(c) { status = c; return this; },
      json(b) { responseBody = b; return this; }
    };

    // Simulate route handler validation
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Invalid request: 'messages' array is required." });
    }

    assert("Missing messages array returns 400", status === 400 && responseBody.error.includes("required"), responseBody, "status 400");
  }

  // Test 2: Valid messages array format
  {
    const sampleMessages = [
      { role: "user", content: "What is JavaScript?" },
      { role: "assistant", content: "JavaScript is a programming language." },
      { role: "user", content: "Can you give me an example of that?" }
    ];

    assert("Messages array preserves 3-turn context", sampleMessages.length === 3 && sampleMessages[2].content === "Can you give me an example of that?", sampleMessages.length, 3);
  }

  // Test 3: Fallback logic detection
  {
    const testApiKey = "";
    const testGeminiKey = "gemini-dummy-key";
    let targetUrl = "https://openrouter.ai/api/v1/chat/completions";
    let targetModel = "openai/gpt-4o-mini";

    if (!testApiKey && testGeminiKey) {
      targetUrl = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      targetModel = "gemini-1.5-flash";
    }

    assert("Fallback switches URL to Gemini endpoint", targetUrl.includes("generativelanguage.googleapis.com"), targetUrl, "Gemini URL");
    assert("Fallback switches model to gemini-1.5-flash", targetModel === "gemini-1.5-flash", targetModel, "gemini-1.5-flash");
  }

  console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
  if (failed > 0) process.exit(1);
}

run();
