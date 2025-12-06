import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ------------ ENV VARIABLES ------------------
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

// ----------- TEST ROUTES ----------------------
app.get("/", (req, res) => {
  res.json({ status: "TutorVerse Backend Running" });
});

// POST test
app.post("/test", (req, res) => {
  res.json({ status: "POST working", body: req.body });
});

// ----------- OPENAI BRAIN ---------------------
app.post("/brain", async (req, res) => {
  try {
    const { question, board, grade, subject } = req.body;

    const prompt = `
You are an expert teaching assistant. 
Explain the topic in simple Indian English.
Board: ${board}
Class: ${grade}
Subject: ${subject}
Student Question: ${question}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are TutorVerse AI Teacher." },
        { role: "user", content: prompt }
      ]
    });

    res.json({ answer: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OpenAI error", details: err.message });
  }
});

// ----------- HEYGEN LIVE AVATAR ENGINE --------
app.post("/avatar/start", async (req, res) => {
  try {
    const { text, avatar_id } = req.body;

    const response = await axios.post(
      "https://api.heygen.com/v1/video.generate",
      {
        avatar_id,
        text,
        voice_id: "default"
      },
      {
        headers: {
          "X-Api-Key": HEYGEN_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ status: "avatar_started", data: response.data });
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).json({ error: "HeyGen error" });
  }
});

// ----------- MANIM ENGINE ---------------------
app.post("/manim", async (req, res) => {
  const { topic } = req.body;
  res.json({
    status: "Manim simulation",
    message: `Manim animation for ${topic} will be processed`
  });
});

// ----------- START SERVER ----------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
