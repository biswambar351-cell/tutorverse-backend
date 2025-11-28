import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("TutorVerse Backend Running 🚀");
});

// Forward API call to Cloudflare Worker
app.post("/start-avatar", async (req, res) => {
  try {
    const WORKER_URL = process.env.WORKER_URL;

    const response = await axios.post(WORKER_URL, req.body);

    res.json({
      backend: "ok",
      worker_response: response.data
    });

  } catch (err) {
    res.status(500).json({
      error: "Backend error",
      details: err.message
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Backend running on port " + PORT));
