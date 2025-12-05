import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// ENV variables
const PORT = process.env.PORT || 8080;
const WORKER_URL = process.env.WORKER_URL;
const HEYGEN_KEY = process.env.HEYGEN_KEY;

// -------------------------
// TEST ROUTE
// -------------------------
app.get("/", (req, res) => {
  res.send("TutorVerse Backend Running 🚀");
});

// -------------------------
// 1) START AVATAR ENGINE
// -------------------------
app.post("/start-avatar", async (req, res) => {
  try {
    const { script } = req.body;

    const heygenResponse = await axios.post(
      "https://api.heygen.com/v1/video.generate",
      {
        video_inputs: [
          {
            avatar_id: "513fd1b7-7ef9-466d-9af2-344e51eeb833",
            input_text: script,
            voice: {
              voice_id: "46be4ddf-214c-40a0-972a-2be2d9f90cf39",
              rate: 1.0
            }
          }
        ]
      },
      { headers: { "x-api-key": HEYGEN_KEY } }
    );

    res.json({
      success: true,
      avatar_job_id: heygenResponse.data.data.video_id
    });

  } catch (err) {
    res.json({
      success: false,
      error: err.message
    });
  }
});

// -------------------------
// 2) MANIM ENGINE
// -------------------------
app.post("/manim", async (req, res) => {
  try {
    const { content } = req.body;
    // Later you will add your Manim server URL here
    res.json({
      status: "manim placeholder",
      content_received: content
    });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// -------------------------
// 3) MASTER ENGINE (AI + AVATAR + MANIM)
// -------------------------
app.post("/engine", async (req, res) => {
  try {
    const { board, standard, subject, chapter } = req.body;

    // Example output for now
    res.json({
      engine: "ok",
      received: { board, standard, subject, chapter }
    });

  } catch (err) {
    res.json({ error: err.message });
  }
});

// -------------------------
app.listen(PORT, () =>
  console.log("Backend running on port " + PORT)
);
// -------------------------------
// HEYGEN AVATAR ENGINE ROUTE
// -------------------------------
app.post("/avatar", async (req, res) => {
  try {
    const { script } = req.body;

    const response = await axios.post(
      "https://api.app.liveavatar.com/v1/video/text_to_video",
      {
        text: script,
        avatar_id: "513fd1b7-7ef9-466d-9af2-344e51eeb833",
        voice_id: "en-US-Emily",
        resolution: "1080p"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.HEYGEN_API_KEY
        }
      }
    );

    res.json({
      success: true,
      avatar_video_id: response.data.video_id
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

