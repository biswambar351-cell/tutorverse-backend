// ---------------------------
// ENV VARIABLES
// ---------------------------
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const WORKER_URL = process.env.WORKER_URL;   // Your Cloudflare Worker
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY; // Your HeyGen Key

// ---------------------------
// TEST ROUTE
// ---------------------------
app.get("/", (req, res) => {
    res.send("TutorVerse Backend Running 🚀");
});

// ---------------------------
// 1) START AVATAR ENGINE (HEYGEN)
// ---------------------------
app.post("/start-avatar", async (req, res) => {
    try {
        const { text } = req.body;

        const response = await axios.post(
            "https://api.heygen.com/v1/live-avatar/create",
            {
                text,
                avatar_id: "default",
                voice_id: "en_us_001"
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-API-KEY": HEYGEN_API_KEY,
                }
            }
        );

        res.json({
            status: "avatar-engine-ok",
            heygen_response: response.data
        });

    } catch (err) {
        console.error("HEYGEN ERROR:", err.response?.data || err.message);
        res.status(500).json({ error: "Avatar Engine Failed" });
    }
});

// ---------------------------
// 2) MANIM ENGINE (OPTIONAL)
// ---------------------------
app.post("/manim", async (req, res) => {
    try {
        const { board, classLevel, subject, chapter, question } = req.body;

        res.json({
            status: "manim-ok",
            message: "Manim animation engine placeholder",
            received: { board, classLevel, subject, chapter, question }
        });

    } catch (err) {
        res.status(500).json({ error: "Manim Engine Failed" });
    }
});

// ---------------------------
// 3) MAIN TUTOR ROUTE (USE WORKER)
// ---------------------------
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

// ---------------------------
// START BACKEND SERVER
// ---------------------------
app.listen(PORT, () => {
    console.log(`🚀 TutorVerse Backend running on PORT ${PORT}`);
});
// ----------------------------------------------
// 2) AVATAR ENGINE (HeyGen Live Avatar)
// ----------------------------------------------

app.post("/start-avatar", async (req, res) => {
    try {
        const { script } = req.body;

        if (!script) {
            return res.status(400).json({ error: "script text required" });
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
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({
            status: "avatar-ok",
            heygen_response: response.data
        });

    } catch (err) {
        console.error("Avatar error:", err.response?.data || err.message);
        res.status(500).json({
            error: "Avatar Engine failed",
            details: err.response?.data || err.message
        });
    }
});
// ----------------------------------------------
// 3) MANIM ENGINE (Animation Generator)
// ----------------------------------------------

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
            error: "Manim Engine failed",
            details: err.message
        });
    }
});
// Server Listener
app.listen(PORT, () => {
    console.log("TutorVerse backend running on PORT", PORT);
});

