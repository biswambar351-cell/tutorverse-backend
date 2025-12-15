import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// ======================
// ENV VARIABLES
// ======================
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY;
const SPEECHIFY_API_KEY = process.env.SPEECHIFY_API_KEY;

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.send("TutorVerse Backend Running 🚀");
});

// ======================
// 1️⃣ BRAIN (OpenAI)
// ======================
app.post("/brain", async (req, res) => {
  try {
    const { question, grade, subject, language = "English" } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a ${grade} ${subject} teacher. Explain clearly in ${language}.`
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    res.json({
      text: completion.choices[0].message.content
    });

  } catch (err) {
    res.status(500).json({ error: "Brain error", details: err.message });
  }
});

// ======================
// 2️⃣ LIVEAVATAR – CREATE SESSION TOKEN
// ======================
app.post("/avatar/token", async (req, res) => {
  try {
    const {
      avatar_id,
      voice_id,
      context_id,
      language = "en"
    } = req.body;

    const response = await axios.post(
      "https://api.liveavatar.com/v1/sessions/token",
      {
        mode: "FULL",
        avatar_id,
        avatar_persona: {
          voice_id,
          context_id,
          language
        }
      },
      {
        headers: {
          "X-API-KEY": LIVEAVATAR_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    res.status(500).json({
      error: "Avatar Engine Error",
      details: err.response?.data || err.message
    });
  }
});

// ======================
// 3️⃣ MANIM (PLACEHOLDER)
// ======================
app.post("/manim", async (req, res) => {
  const { topic } = req.body;

  // Here you will trigger Manim (Python service / container)
  // For now, we simulate response

  res.json({
    status: "Manim job started",
    topic,
    video_url: "https://example.com/manim-output.mp4"
  });
});

// ======================
// 4️⃣ SPEECHIFY TTS
// ======================
app.post("/tts", async (req, res) => {
  try {
    const { text, voice = "male" } = req.body;

    const response = await axios.post(
      "https://api.sws.speechify.com/v1/audio/speech",
      {
        input: text,
        voice
      },
      {
        headers: {
          Authorization: `Bearer ${SPEECHIFY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (err) {
    res.status(500).json({ error: "Speechify error", details: err.message });
  }
});

// ======================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log("TutorVerse backend running on port", PORT)
);
