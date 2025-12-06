// ================================
// ENV VARIABLES
// ================================
import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";

// Load ENV vars from Railway
const PORT = process.env.PORT || 8080;
const WORKER_URL = process.env.WORKER_URL; 
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Init OpenAI
const client = new OpenAI({
    apiKey: OPENAI_API_KEY
});

// Init express
const app = express();
app.use(cors());
app.use(express.json());

// ================================
// TEST ROUTE
// ================================
app.get("/", (req, res) => {
    res.send("TutorVerse Backend Running ✔");
});


// ================================
// 1) START AVATAR ENGINE
// ================================
app.post("/start-avatar", async (req, res) => {
    try {
        const { board, cls, subject, chapter, question } = req.body;

        const payload = {
            board,
            cls,
            subject,
            chapter,
            question
        };

        const response = await axios.post(
            `${WORKER_URL}/avatar`,
            payload,
            {
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": HEYGEN_API_KEY
                }
            }
        );

        res.json({
            status: "avatar-ok",
            data: response.data
        });

    } catch (err) {
        res.status(500).json({
            error: "Avatar Engine Failed",
            details: err.message
        });
    }
});


// ================================
// 2) OPENAI “AI BRAIN” ENGINE
// ================================
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
        console.error("OPENAI ERROR:", err);
        res.status(500).json({ error: "AI Engine Error" });
    }
});


// ================================
// 3) MANIM ENGINE
// ================================
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


// ================================
// LISTEN ON PORT
// ================================
app.listen(PORT, () => {
    console.log("TutorVerse backend running on PORT", PORT);
});
