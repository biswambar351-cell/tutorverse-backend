import express from "express";
import cors from "cors";
import axios from "axios";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

// ENV VARIABLES
const PORT = process.env.PORT || 8080;
const WORKER_URL = process.env.WORKER_URL;
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ------------------------------
// TEST ROUTE
// ------------------------------
app.get("/", (req, res) => {
    res.send("TutorVerse Backend Running ✔");
});

// ------------------------------
// 1) START AVATAR ENGINE
// ------------------------------
app.post("/start-avatar", async (req, res) => {
    try {
        const { chapter, question } = req.body;

        const workerResponse = await axios.post(
            `${WORKER_URL}/avatar`,
            { chapter, question },
            { headers: { "Content-Type": "application/json" } }
        );

        res.json({
            status: "avatar-ok",
            result: workerResponse.data
        });

    } catch (err) {
        console.error("Avatar Engine Error:", err.message);
        res.status(500).json({ error: "Avatar Engine Failed" });
    }
});

// ------------------------------
// 2) AI BRAIN ENGINE (OpenAI)
// ------------------------------
const client = new OpenAI({
    apiKey: OPENAI_API_KEY
});

app.post("/ai-brain", async (req, res) => {
    try {
        const { board, chapter, question } = req.body;

        const prompt = `
Board: ${board}
Chapter: ${chapter}
Question: ${question}

Explain the answer very simply like a real teacher.
        `;

        const aiRes = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are TutorVerse AI Teacher." },
                { role: "user", content: prompt }
            ]
        });

        res.json({
            status: "ai-ok",
            answer: aiRes.choices[0].message.content
        });

    } catch (err) {
        console.error("AI Engine Error:", err.message);
        res.status(500).json({ error: "AI Engine Failed" });
    }
});

// ------------------------------
// 3) MANIM ENGINE (Placeholder)
// ------------------------------
app.post("/start-manim", async (req, res) => {
    try {
        const { chapter, question } = req.body;

        res.json({
            status: "manim-ok",
            message: "Manim engine placeholder",
            received: { chapter, question }
        });

    } catch (err) {
        res.status(500).json({ error: "Manim Engine Failed" });
    }
});

// ------------------------------
// SERVER LISTENER
// ------------------------------
app.listen(PORT, () => {
    console.log("TutorVerse backend running on PORT", PORT);
});
