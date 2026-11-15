import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();
app.use(cors());          // lets the React site (port 5173) call this server
app.use(express.json());  // reads JSON sent from the front end

// ---------- Health check ----------

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ---------- Readings (heart rate, blood pressure, temperature...) ----------

// All readings, newest first
app.get("/api/readings", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM readings ORDER BY recorded_at DESC, id DESC LIMIT 200")
    .all();
  res.json(rows);
});

// The most recent reading of each type (for the Body Map and dashboard)
app.get("/api/readings/latest", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM readings WHERE id IN (SELECT MAX(id) FROM readings GROUP BY type)")
    .all();
  res.json(rows);
});

// Save a new reading
app.post("/api/readings", (req, res) => {
  const { type, value, unit } = req.body;
  if (!type || value === undefined || value === "") {
    return res.status(400).json({ error: "type and value are required" });
  }
  const result = db
    .prepare("INSERT INTO readings (type, value, unit) VALUES (?, ?, ?)")
    .run(type, String(value), unit ?? null);
  const row = db.prepare("SELECT * FROM readings WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(row);
});

// ---------- Daily check-ins (mood, stress, sleep, symptoms) ----------

app.get("/api/checkins", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM checkins ORDER BY created_at DESC, id DESC LIMIT 100")
    .all();
  res.json(rows);
});

app.post("/api/checkins", (req, res) => {
  const { mood, stress, sleep_hours, symptoms, notes } = req.body;
  const result = db
    .prepare(
      "INSERT INTO checkins (mood, stress, sleep_hours, symptoms, notes) VALUES (?, ?, ?, ?, ?)"
    )
    .run(mood ?? null, stress ?? null, sleep_hours ?? null, symptoms ?? null, notes ?? null);
  const row = db.prepare("SELECT * FROM checkins WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(row);
});

// ---------- Space weather from NASA DONKI ----------

// Reads one type of DONKI event (FLR = solar flares, SEP = solar energetic particles)
async function getDonki(type, startDate, endDate) {
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  const url = `https://api.nasa.gov/DONKI/${type}?startDate=${startDate}&endDate=${endDate}&api_key=${key}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`DONKI ${type} returned ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : []; // DONKI can return an empty body when there are no events
}

let spaceWeatherCache = null; // keeps results for 10 minutes to stay under NASA's request limit

app.get("/api/space-weather", async (req, res) => {
  if (spaceWeatherCache && Date.now() - spaceWeatherCache.time < 10 * 60 * 1000) {
    return res.json(spaceWeatherCache.data);
  }

  const day = (d) => d.toISOString().slice(0, 10);
  const today = new Date();
  const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

  try {
    const [flares, particles] = await Promise.all([
      getDonki("FLR", day(threeDaysAgo), day(today)),
      getDonki("SEP", day(threeDaysAgo), day(today)),
    ]);

    // Simplified demo rule: particle event = danger, strong (M or X class) flare = caution
    const strongFlares = flares.filter((f) => /^[MX]/.test(f.classType || ""));
    const status = particles.length > 0 ? "danger" : strongFlares.length > 0 ? "caution" : "safe";

    const data = {
      status,
      solarFlares: flares.length,
      strongFlares: strongFlares.length,
      particleEvents: particles.length,
      latestFlareClass: flares.length ? flares[flares.length - 1].classType : null,
      source: "NASA DONKI",
      checkedAt: new Date().toISOString(),
    };

    spaceWeatherCache = { time: Date.now(), data };
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: "Could not reach NASA DONKI", details: err.message });
  }
});

// ---------- Start the server ----------

const PORT = 3001;

app.get("/api/nasa/sleep/subjects", (req, res) => {
  const subjects = db.prepare(`
    SELECT subject_id, COUNT(*) AS total_records
    FROM nasa_sleep_records
    GROUP BY subject_id
    ORDER BY subject_id
  `).all();

  res.json(subjects);
});

app.get("/api/nasa/sleep/:subjectId", (req, res) => {
  const records = db.prepare(`
    SELECT *
    FROM nasa_sleep_records
    WHERE subject_id = ?
    ORDER BY measurement_date ASC, id ASC
  `).all(req.params.subjectId);

  res.json(records);
});

app.listen(PORT, () => {
  console.log(`AstroHealth server running at http://localhost:${PORT}`);
});