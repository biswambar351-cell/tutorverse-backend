// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // if Node >=18 you can use global fetch
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const LIVEAVATAR_API_KEY = process.env.LIVEAVATAR_API_KEY;
const AVATAR_ID = process.env.LIVEAVATAR_AVATAR_ID;
const VOICE_ID = process.env.LIVEAVATAR_VOICE_ID;
const CONTEXT_ID = process.env.LIVEAVATAR_CONTEXT_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MANIM_SERVER_URL = process.env.MANIM_SERVER_URL; // optional

if (!LIVEAVATAR_API_KEY) {
  console.warn("Warning: LIVEAVATAR_API_KEY not set");
}

// ---------- Helper: call LiveAvatar /sessions/token  ----------
async function createLiveAvatarSessionToken(mode = "FULL", voiceId = VOICE_ID) {
  const url = "https://api.liveavatar.com/v1/sessions/token";
  const body = {
    mode: mode.toUpperCase(), // "FULL" recommended
    avatar_id: AVATAR_ID,
    avatar_persona: {
      voice_id: voiceId,
      context_id: CONTEXT_ID,
      language: "en"
    }
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": LIVEAVATAR_API_KEY
    },
    body: JSON.stringify(body)
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw { status: resp.status, body: data };
  }
  return data; // expected: { session_id, session_token, ... }
}

// ---------- Helper: start session (requires session token) ----------
async function startLiveAvatarSession(sessionToken) {
  const url = "https://api.liveavatar.com/v1/sessions/start";
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${sessionToken}`
    },
    body: JSON.stringify({}) // docs often accept empty body for start
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw { status: resp.status, body: data };
  }
  return data; // expected: info with livekit room url / tokens
}

// ---------- Route: create session token (frontend calls this) ----------
app.post("/api/create-session", async (req, res) => {
  try {
    const { mode, voice_id } = req.body || {};
    const tokenResp = await createLiveAvatarSessionToken(mode || "FULL", voice_id || VOICE_ID);
    // Return entire token info to frontend (session_token will be used by frontend with SDK)
    res.json({ ok: true, session: tokenResp });
  } catch (err) {
    console.error("create-session error:", err);
    const status = err?.status || 500;
    res.status(status).json({ ok: false, error: err?.body || err?.toString() });
  }
});

// ---------- Route: start session (server can also start) ----------
app.post("/api/start-session", async (req, res) => {
  try {
    const { session_token } = req.body;
    if (!session_token) return res.status(400).json({ ok: false, error: "session_token required" });
    const startResp = await startLiveAvatarSession(session_token);
    res.json({ ok: true, start: startResp });
  } catch (err) {
    console.error("start-session error:", err);
    const status = err?.status || 500;
    res.status(status).json({ ok: false, error: err?.body || err?.toString() });
  }
});

// ---------- Route: AI brain (OpenAI) ----------
app.post("/api/brain", async (req, res) => {
  try {
    const { prompt, board, class_level, subject } = req.body;
    if (!prompt) return res.status(400).json({ ok: false, error: "prompt required" });

    // Build system + user messages for student-friendly explanation
    const system = {
      role: "system",
      content: "You are a friendly Indian school maths tutor. Use Hinglish optionally; keep explanations simple with examples."
    };
    const user = {
      role: "user",
      content: `Board: ${board || "CBSE"}, Class: ${class_level || "9"}, Subject: ${subject || "Mathematics"}\n\n${prompt}`
    };

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // change if needed
        messages: [system, user],
        max_tokens: 800,
        temperature: 0.6
      })
    });

    const openaiData = await openaiResp.json();
    if (!openaiResp.ok) {
      return res.status(openaiResp.status).json({ ok: false, error: openaiData });
    }

    const explanation = openaiData.choices?.[0]?.message?.content || "";

    res.json({ ok: true, explanation, raw: openaiData });
  } catch (err) {
    console.error("OpenAI error", err);
    res.status(500).json({ ok: false, error: err.toString() });
  }
});

// ---------- Route: Manim rendering trigger (your Manim server should implement /render) ----------
app.post("/api/manim", async (req, res) => {
  try {
    const { text, class_level, subject } = req.body;
    if (!MANIM_SERVER_URL) return res.status(500).json({ ok: false, error: "MANIM_SERVER_URL not configured" });

    const resp = await fetch(`${MANIM_SERVER_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, class_level, subject })
    });

    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ ok: false, error: data });

    // expected data: { videoURL: "https://..." }
    res.json({ ok: true, videoURL: data.videoURL, meta: data });
  } catch (err) {
    console.error("manim error", err);
    res.status(500).json({ ok: false, error: err.toString() });
  }
});

// ---------- Simple health ----------
app.get("/", (req, res) => {
  res.send("TutorVerse backend alive");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
