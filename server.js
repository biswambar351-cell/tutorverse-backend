//----------------------------------------------------
// IMPORTS
//----------------------------------------------------
import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";

//----------------------------------------------------
// APP SETUP
//----------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

//----------------------------------------------------
// ENV VARIABLES
//----------------------------------------------------
const PORT = process.env.PORT || 8080;
const WORKER_URL = process.env.WORKER_URL;
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

//----------------------------------------------------
// TEST ROUTE
//----------------------------------------------------
app.get("/", (req, res) => {
  res.send("TutorVerse Backend Running 🚀");
});

//----------------------------------------------------
// 1) HEYGEN AVATAR ENGINE
//----------------------------------------------------
app.post("/start-avatar", async (req, res) => {
  try {
    const { script } = req.body;

    if (!script) {
      return res.status(400).json({ error: "Script text required" });
    }

    const response = await axios.post(
      "https://api.heygen.com/v1/video.generate",
      {
        model: "avatar",
        voice: "en_us_001",
        input_text: script
      },
      {
        headers: {
          "X-Api-Key": HEYGEN_API_KEY,
          "Content-Type": "application/json",
        }
      }
    );

    res.json({
      status: "avatar-ok",
      heygen_response: response.data
    });

  } catch (err) {
    console.error("HEYGEN ERROR:", err.response?.data || err.message);
    res.status(500).json({ error: "Avatar Engine Failed" });
  }
});

//----------------------------------------------------
// 2) MANIM ENGINE (Placeholder)
//----------------------------------------------------
app.post("/start-manim", async (req, res) => {
  try {
    const { chapter, question } = req.body;

    res.json({
      status: "manim-ok",
      message: "Manim placeholder working.",
      received: { chapter, question }
    });

  } catch (err) {
    res.status(500).json({ error: "Manim Engine Failed" });
  }
});

//----------------------------------------------------
// 3) OPENAI AI BRAIN ENGINE
//----------------------------------------------------
const client = new OpenAI({ apiKey: OPENAI_API_KEY });

app.post("/ask-ai", async (req, res) => {
  try {
    const { board, class: className, subject, chapter, question } = req.body;

    const prompt = `
You are TutorVerse AI.
Board: ${board}
Class: ${className}
Subject: ${subject}
Chapter: ${chapter}
Question: ${question}

Explain in very simple words like a real Indian teacher.
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

//----------------------------------------------------
// 4) LESSON ROUTE → SEND DATA TO WORKER
//----------------------------------------------------
app.post("/lesson", async (req, res) => {
  try {
    const response = await axios.post(WORKER_URL + "/lesson", req.body);

    res.json({
      status: "backend-ok",
      worker_response: response.data
    });

  } catch (err) {
    res.status(500).json({ error: "Lesson Route Failed" });
  }
});

//----------------------------------------------------
// START BACKEND SERVER
//----------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 TutorVerse backend running on PORT ${PORT}`);
});
