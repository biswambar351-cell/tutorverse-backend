// -------------------------------------------
//  ENV VARIABLES
// -------------------------------------------
const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const WORKER_URL = process.env.WORKER_URL;
const PORT = process.env.PORT || 8080;

// -------------------------------------------
import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------------------
//  TEST ROUTE
// -------------------------------------------
app.get("/", (req, res) => {
  res.send("TutorVerse Backend Running 🚀");
});

// -------------------------------------------
// 1) START AVATAR ENGINE
// -------------------------------------------
app.post("/start-avatar", async (req, res) => {
  try {
    const { board, class: className, subject, chapter, question } = req.body;

    // Send data to Cloudflare Worker
    const workerResponse = await axios.post(`${WORKER_URL}/start-avatar`, {
      board,
      class: className,
      subject,
      chapter,
      question
    });

    res.json({
      status: "avatar-started",
      workerReply: workerResponse.data
    });

  } catch (err) {
    console.error("AVATAR ERROR:", err.message);
    res.status(500).json({ error: "Avatar Engine Failed" });
  }
});

// -------------------------------------------
// 2) MANIM ANIMATION ENGINE (PLACEHOLDER)
// -------------------------------------------
app.post("/manim", async (req, res) => {
  try {
    const { topic } = req.body;

    res.json({
      status: "manim-ok",
      message: `Manim animation request received for: ${topic}`
    });

  } catch (err) {
    console.error("MANIM ERROR:", err.message);
    res.status(500).json({ error: "Manim Engine Failed" });
  }
});

// -------------------------------------------
// START SERVER
// -------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 TutorVerse backend running on port ${PORT}`);
});
