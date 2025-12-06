// ------------------------------
// IMPORTS
// ------------------------------
import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";

// ------------------------------
// ENV VARIABLES
// ------------------------------
const PORT = process.env.PORT || 8080;
const WORKER_URL = process.env.WORKER_URL;     // Cloudflare Worker
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ------------------------------
// APP SETUP
// ------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------
// TEST ROUTE
// ------------------------------
app.get("/", (req, res) => {
    res.send("TutorVerse Backend Running 🌐");
});

// ------------------------------
// 1) START AVATAR ENGINE
// ------------------------------
app.post("/start-avatar", async (req, res) => {
    try {
        const payload = req.body;

        const response = await axios.post(
            `${WORKER_URL}/avatar`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${HEYGEN_API_KEY}`
                }
            }
        );

        res.json({
            status: "avatar-ok",
            result: response.data
        });

    } catch (err) {
        console.error("AVATAR ENGINE ERROR:", err.response?.data || err.message);
        res.status(500).json({ error: "Avatar Engine Failed" });
    }
});

// ------------------------------
// 2) OPENAI “AI BRAIN ENGINE”
// ------------------------------
const client = new OpenAI({
    apiKey: OPENAI_API_KEY
});

app.post("/brain", async (req, res) => {
    try {
        const { board, cls, subject, chapter, question } = req.body;

        const prompt = `
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
        console.error("OPENAI ERROR:", err.message);
        res.status(500).json({ error: "AI Engine Error" });
    }
});

// ------------------------------
// 3) MANIM ANIMATION ENGINE
// ------------------------------
app.post("/start-manim", async (req, res) => {
    try {
        const { chapter, question } = req.body;

        res.json({
            status: "manim-ok",
            message: "Manim animation engine placeholder",
            received: { chapter, question }
        });

    } catch (err) {
        res.status(500).json({
            error: "Manim Engine Failed",
            details: err.message
        });
    }
});

// ------------------------------
// SERVER LISTENER
// ------------------------------
app.listen(PORT, () => {
    console.log("TutorVerse backend running on PORT", PORT);
});
