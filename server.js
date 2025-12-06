import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";

// -----------------------------
// ENV VARIABLES
// -----------------------------
const PORT = process.env.PORT || 8080;
const WORKER_URL = process.env.WORKER_URL;
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// -----------------------------
// APP SETUP
// -----------------------------
const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------
// TEST ROUTE
// -----------------------------
app.get("/", (req, res) => {
  res.send("TutorVerse Backend OK 🚀");
});

// =======================================================
// 1) AVATAR ENGINE (HeyGen Live Avatar)
// =======================================================
app.post("/start-avatar", async (req, res) => {
  try {
    const { script } = req.body;

    const response = await axios.post(
      "https://api.heygen.com/v1/video.generate",
      {
        text: script,
        voice: "en-US-Jenny",
        avatar: "default"
      },
      {
        headers: {
          "X-Api-Key": HEYGEN_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      status: "avatar-ok",
      data: response.data
    });

  } catch (err) {
    console.error("HEYGEN ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Avatar Engine Error" });
  }
});

// =======================================================
// 2) OPENAI "BRAIN" ENGINE  (MAIN AI TEACHER)
// =======================================================

const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

app.post("/brain", async (req, res) => {
  try {
    const { board, cls, subject, chapter, question } = req.body;

    const prompt = `
You are TutorVerse AI Teacher.

Board: ${board}
Class: ${cls}
Subject: ${subject}
Chapter: ${chapter}
Question: ${question}

Explain the answer in very simple words like a real teacher.
`;

    const aiResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are TutorVerse AI Teacher." },
        { role: "user", content: prompt }
      ]
    });

    res.json({
      status: "ai-ok",
      answer: aiResponse.choices[0].message.content
    });

  } catch (err) {
    console.error("OPENAI ERROR:", err);
    res.status(500).json({ error: "AI Engine Error" });
  }
});

// =======================================================
// 3) MANIM ANIMATION ENGINE (Worker Placeholder)
// =======================================================
app.post("/start-manim", async (req, res) => {
  try {
    const { chapter, question } = req.body;

    res.json({
      status: "manim-ok",
      message: "Manim animation engine placeholder.",
      received: { chapter, question }
    });

  } catch (err) {
    res.status(500).json({
      error: "Manim Engine Failed",
      details: err.message
    });
  }
});

// =======================================================
// SERVER LISTENER
// =======================================================
app.listen(PORT, () => {
  console.log("TutorVerse backend running on PORT", PORT);
});
