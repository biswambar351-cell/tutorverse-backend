import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// ENV
const PORT = process.env.PORT || 8080;
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ------------------------------
// TEST ROUTE
// ------------------------------
app.get("/", (req, res) => {
  res.send("TutorVerse Backend Running 🚀");
});

// ------------------------------
// 1) BRAIN ENGINE  (OpenAI)
// ------------------------------
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

Explain the answer in simple teacher language for Indian students.
`;

    const aiRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are TutorVerse AI Teacher." },
          { role: "user", content: prompt }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    return res.json({
      status: "ai-ok",
      answer: aiRes.data.choices[0].message.content
    });

  } catch (err) {
    console.error("OPENAI ERROR:", err);
    return res.status(500).json({ error: "AI Engine Error" });
  }
});

// ------------------------------
// 2) MANIM ENGINE (Placeholder)
// ------------------------------
app.post("/manim", async (req, res) => {
  try {
    const { chapter, question } = req.body;

    return res.json({
      status: "manim-ok",
      message: "Manim engine placeholder",
      received: { chapter, question }
    });

  } catch (e) {
    return res.status(500).json({ error: "Manim Engine Error" });
  }
});

// ------------------------------
// 3) AVATAR ENGINE (Send Text to Avatar Session)
// ------------------------------
app.post("/avatar", async (req, res) => {
  try {
    const { session_id, text } = req.body;

    const url = "https://api.liveavatar.com/v1/sessions/text";

    const avatarRes = await axios.post(
      url,
      { session_id, text },
      {
        headers: {
          "X-API-KEY": HEYGEN_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({
      status: "avatar-ok",
      response: avatarRes.data
    });

  } catch (e) {
    console.error("Avatar Error:", e.response?.data || e.message);
    return res.status(500).json({
      error: "Avatar Engine Error",
      details: e.response?.data || e.message
    });
  }
});

// ------------------------------
// RUN SERVER
// ------------------------------
app.listen(PORT, () => {
  console.log("TutorVerse backend running on PORT", PORT);
});
