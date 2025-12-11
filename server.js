// ---------------------------
// TutorVerse Backend (Railway)
// ---------------------------
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------
// ENVIRONMENT VARIABLES
// ---------------------------
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const LIVEAVATAR_KEY = process.env.LIVEAVATAR_API_KEY;

// ---------------------------
// Root Check
// ---------------------------
app.get("/", (req, res) => {
  res.json({ msg: "TutorVerse Backend Running" });
});

// ---------------------------
// 1) BRAIN ENGINE  (/brain)
// ---------------------------
app.post("/brain", async (req, res) => {
  try {
    const { board, cls, subject, chapter, question } = req.body;

    const prompt = `
You are a teacher. Explain to a class ${cls} student.
Board: ${board}
Subject: ${subject}
Chapter: ${chapter}
Question: ${question}
Explain clearly in simple language.
`;

    const payload = {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    };

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const aiJson = await aiRes.json();

    return res.json({
      status: "ai-ok",
      answer: aiJson.choices?.[0]?.message?.content || "No output",
    });
  } catch (err) {
    return res.status(500).json({
      error: "Brain Engine Error",
      details: err.message,
    });
  }
});

// ---------------------------
// 2) MANIM ENGINE  (/manim)
// ---------------------------
app.post("/manim", async (req, res) => {
  return res.json({
    status: "manim-ok",
    message: "Manim placeholder response",
    received: req.body,
  });
});

// ---------------------------
// 3) AVATAR ENGINE  (/avatar)
// ---------------------------
app.post("/avatar", async (req, res) => {
  try {
    const { avatar_id, voice_id, context_id, text } = req.body;

    // STEP 1: Create session token
    const sessionPayload = {
      mode: "FULL",
      avatar_id,
      avatar_persona: {
        voice_id,
        context_id,
        language: "en",
      },
    };

    const sessionReq = await fetch(
      "https://api.liveavatar.com/v1/sessions/token",
      {
        method: "POST",
        headers: {
          "X-API-KEY": LIVEAVATAR_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(sessionPayload),
      }
    );

    const sessionJson = await sessionReq.json();

    if (!sessionReq.ok)
      return res.status(500).json({
        error: "Avatar Session Error",
        details: sessionJson,
      });

    const session_id = sessionJson.data.session_id;

    // STEP 2: Send text message
    const textReq = await fetch(
      "https://api.liveavatar.com/v1/sessions/text",
      {
        method: "POST",
        headers: {
          "X-API-KEY": LIVEAVATAR_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          session_id,
          text,
        }),
      }
    );

    const textJson = await textReq.json();

    return res.json({
      status: "avatar-ok",
      session_id,
      response: textJson,
    });
  } catch (err) {
    return res.status(500).json({
      error: "Avatar Engine Error",
      details: err.message,
    });
  }
});

// ---------------------------
// Start Server
// ---------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
