require("dotenv").config();
const express  = require("express");
const path     = require("path");
const https    = require("https");

const app  = express();
const PORT = process.env.PORT || 3000;

/* ── Serve static files (index.html, weather.css, script.js) ── */
app.use(express.static(path.join(__dirname)));

/* ── Weather proxy — keeps API key off the client ─────────── */
app.get("/api/weather", (req, res) => {
  const city = req.query.q;
  if (!city) {
    return res.status(400).json({ error: "Missing city parameter" });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("OPENWEATHER_API_KEY is not set in .env");
    return res.status(500).json({ error: "Server misconfiguration: API key missing" });
  }

  const upstream = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  https.get(upstream, (apiRes) => {
    let raw = "";
    apiRes.on("data", chunk => raw += chunk);
    apiRes.on("end", () => {
      try {
        const json = JSON.parse(raw);
        res.status(apiRes.statusCode).json(json);
      } catch {
        res.status(502).json({ error: "Bad response from weather API" });
      }
    });
  }).on("error", (err) => {
    console.error("Upstream request failed:", err.message);
    res.status(502).json({ error: "Failed to reach weather API" });
  });
});

/* ── Start ─────────────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`Skye Weather running → http://localhost:${PORT}`);
});
