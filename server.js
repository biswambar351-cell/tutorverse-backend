import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------
// ENVIRONMENT VARIABLES
// -------------------------
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;

// -------------------------
// INITIALIZE OPENAI CLIENT
// -------------------------
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// -------------------------
// ROUTE: TEST
// -------------------------
app.get("/", (req, res) => {
  res.json({ status: "TutorVerse Backend Running" });
});

// -------------------------
// ROUTE: BRAIN (OpenAI)
// -------------------------
app.post("/brain", async (req, res) => {
  try {
    const { board, cls, subject, question } = req.body;

    const prompt = `
You are an AI Tutor for Indian school students.
Board: ${board}
Class: ${cls}
Subject: ${subject}
Student Question: ${question}

Explain simply in bilingual (English + Hindi) with examples.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      answer: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "OpenAI failed" });
  }
});

// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`TutorVerse backend running on port ${PORT}`);
});
