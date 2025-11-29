import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TutorVerse Backend Running 🚀");
});

// -------- MAIN ENGINE ROUTE --------
app.post("/engine", async (req, res) => {
  try {
    const { board, class: grade, subject, chapter, question } = req.body;

    // Step 1 → ChatGPT-like explanation (placeholder)
    const explanation = `
Board: ${board}
Class: ${grade}
Subject: ${subject}
Chapter: ${chapter}

Question: ${question}

🧠 TutorVerse AI Explanation:
This is only a placeholder response.
Next, we will integrate:
✔ ChatGPT
✔ HeyGen LiveAvatar
✔ Manim
    `;

    // Step 2 → Respond back
    return res.json({
      status: "backend-ok",
      explanation: explanation.trim(),
      received: req.body
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// -------- OLD ROUTE ----------
app.post("/start-avatar", async (req, res) => {
  try {
    const response = await axios.post(process.env.WORKER_URL, req.body);
    res.json({ worker_response: response.data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Backend running on port " + PORT));
