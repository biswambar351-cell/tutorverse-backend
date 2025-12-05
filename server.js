import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------------------
//  ROOT TEST ROUTE
// -----------------------------------------
app.get("/", (req, res) => {
  res.send("TutorVerse Backend Running ✔");
});

// -----------------------------------------
// 1) AVATAR ENGINE ROUTE
// -----------------------------------------
app.post("/avatar", async (req, res) => {
  try {
    const WORKER_URL = process.env.WORKER_URL;

    const response = await axios.post(
      WORKER_URL + "/avatar",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );

    return res.json({
      status: "avatar-engine-ok",
      worker_response: response.data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Avatar engine failed",
      details: err.message
    });
  }
});

// -----------------------------------------
// 2) MANIM ENGINE ROUTE
// -----------------------------------------
app.post("/manim", async (req, res) => {
  try {
    const WORKER_URL = process.env.WORKER_URL;

    const response = await axios.post(
      WORKER_URL + "/manim",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );

    return res.json({
      status: "manim-engine-ok",
      worker_response: response.data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Manim engine failed",
      details: err.message
    });
  }
});

// -----------------------------------------
// 3) COMBINED ENGINE (Avatar + Manim)
// -----------------------------------------
app.post("/engine", async (req, res) => {
  try {
    const WORKER_URL = process.env.WORKER_URL;

    const response = await axios.post(
      WORKER_URL + "/engine",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );

    return res.json({
      status: "complete-engine-ok",
      worker_response: response.data
    });

  } catch (err) {
    return res.status(500).json({
      error: "Main engine failed",
      details: err.message
    });
  }
});

// -----------------------------------------
// LISTEN PORT
// -----------------------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("TutorVerse Backend running on", PORT));
