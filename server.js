import express from "express";
import cors from "cors";
import OpenAI from "openai";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// 🔑 Environment Variables
// -----------------------------
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

// -----------------------------
// 🧠 OpenAI Client
// -----------------------------
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// -----------------------------
// 📌 Health Check Route
// -----------------------------
app.get("/", (req, res) => {
  res.json({ status: "TutorVerse Backend Running" });
});

// -----------------------------
// 🧠 AI Brain (OpenAI)
// -----------------------------
app.post("/ai-brain", async (req, res) => {
  try {
    const { board, grade, subject, question } = req.body;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are TutorVerse AI, an expert Indian school tutor. Use textbook style explanation + simple examples."
        },
        {
          role: "user",
          content: `Board: ${board}, Class: ${grade}, Subject: ${subject}.  
          Student question: ${question}`
        }
      ]
    });

    res.json({
      answer: response.choices[0].message.content
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI Error" });
  }
});

// -----------------------------
// 🧑‍🏫 Start HeyGen Avatar
// -----------------------------
app.post("/avatar/start", async (req, res) => {
  try {
    const { script } = req.body;

    const avatarRequest = await fetch(
      "https://api.heygen.com/v2/video/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": HEYGEN_API_KEY
        },
        body: JSON.stringify({
          avatar_id: "513fd1b7-7ef9-466d-9af2-344e51eeb833",
          text: script,
          voice: "default"
        })
      }
    );

    const data = await avatarRequest.json();
    res.json({ heygen_response: data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "HeyGen Error" });
  }
});

// -----------------------------
// ➗ Manim Animation Placeholder
// -----------------------------
app.post("/manim/generate", async (req, res) => {
  res.json({
    status: "Manim engine not connected yet — waiting for Cloudflare Worker link"
  });
});

// -----------------------------
// 🚀 Start Server
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`TutorVerse backend running on port ${PORT}`));
