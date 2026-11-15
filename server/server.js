import 'dotenv/config';
import { askHealthAssistant } from './ai.js';
import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

// ---------- Health check ----------

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// ---------- Health readings ----------

app.get("/api/readings", (req, res) => {
  const rows = db
    .prepare(`
      SELECT *
      FROM readings
      ORDER BY recorded_at DESC, id DESC
      LIMIT 200
    `)
    .all();

  res.json(rows);
});

app.get("/api/readings/latest", (req, res) => {
  const rows = db
    .prepare(`
      SELECT *
      FROM readings
      WHERE id IN (
        SELECT MAX(id)
        FROM readings
        GROUP BY type
      )
    `)
    .all();

  res.json(rows);
});

app.post("/api/readings", (req, res) => {
  const { type, value, unit } = req.body;

  if (!type || value === undefined || value === "") {
    return res.status(400).json({
      error: "type and value are required",
    });
  }

  const result = db
    .prepare(`
      INSERT INTO readings (type, value, unit)
      VALUES (?, ?, ?)
    `)
    .run(type, String(value), unit ?? null);

  const row = db
    .prepare("SELECT * FROM readings WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(row);
});

// ---------- Daily check-ins ----------

app.get("/api/checkins", (req, res) => {
  const rows = db
    .prepare(`
      SELECT *
      FROM checkins
      ORDER BY created_at DESC, id DESC
      LIMIT 100
    `)
    .all();

  res.json(rows);
});

app.post("/api/checkins", (req, res) => {
  const {
    mood,
    stress,
    sleep_hours,
    symptoms,
    notes,
  } = req.body;

  const result = db
    .prepare(`
      INSERT INTO checkins
      (mood, stress, sleep_hours, symptoms, notes)
      VALUES (?, ?, ?, ?, ?)
    `)
    .run(
      mood ?? null,
      stress ?? null,
      sleep_hours ?? null,
      symptoms ?? null,
      notes ?? null
    );

  const row = db
    .prepare("SELECT * FROM checkins WHERE id = ?")
    .get(result.lastInsertRowid);

  res.status(201).json(row);
});

// ---------- Dashboard ----------

// Required measurements from the original Dashboard.
const REQUIRED_FIELDS = {
  heartRate: {
    min: 1,
    max: 300,
  },
  bloodPressure: {
    min: 1,
    max: 300,
  },
  sleepHours: {
    min: 0,
    max: 24,
  },
  stressLevel: {
    min: 0,
    max: 10,
  },
};

// Additional measurements from the expanded Dashboard.
const OPTIONAL_FIELDS = {
  diastolic: {
    type: "blood_pressure_diastolic",
    unit: "mmHg",
    min: 1,
    max: 300,
  },

  mood: {
    type: "mood",
    unit: "/5",
    min: 1,
    max: 5,
  },

  oxygenLevel: {
    type: "oxygen_level",
    unit: "%",
    min: 0,
    max: 100,
  },

  temperature: {
    type: "temperature",
    unit: "°C",
    min: 20,
    max: 45,
  },

  bloodSugar: {
    type: "blood_sugar",
    unit: "mg/dL",
    min: 1,
    max: 1000,
  },

  waterIntake: {
    type: "water_intake",
    unit: "L",
    min: 0,
    max: 30,
  },

  exercise: {
    type: "exercise",
    unit: "min",
    min: 0,
    max: 1440,
  },

  visionCheck: {
    type: "vision_check",
    unit: null,
    text: true,
  },

  nausea: {
    type: "nausea",
    unit: "/10",
    min: 0,
    max: 10,
  },

  dizziness: {
    type: "dizziness",
    unit: "/10",
    min: 0,
    max: 10,
  },

  radiationDose: {
    type: "radiation_dose",
    unit: "mSv",
    min: 0,
    max: 100000,
  },
};

// Convert empty optional measurements to null.
function normalizeOptionalFields(input) {
  const result = {};

  for (const [key, config] of Object.entries(
    OPTIONAL_FIELDS
  )) {
    const value = input[key];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      result[key] = null;
      continue;
    }

    if (config.text) {
      if (
        typeof value !== "string" ||
        value.length > 300
      ) {
        throw new Error(
          `${key} must be text with at most 300 characters.`
        );
      }

      result[key] = value.trim() || null;
      continue;
    }

    const number = Number(value);

    if (
      !Number.isFinite(number) ||
      number < config.min ||
      number > config.max
    ) {
      throw new Error(
        `${key} must be between ${config.min} and ${config.max}.`
      );
    }

    result[key] = number;
  }

  return result;
}

// Convert a database row into the format React expects.
function formatDashboard(row) {
  if (!row) {
    return null;
  }

  let extras = {};

  if (row.extra_json) {
    try {
      extras = JSON.parse(row.extra_json);
    } catch (error) {
      console.error(
        "Could not parse saved optional measurements:",
        error
      );
    }
  }

  return {
    name: row.name,
    heartRate: row.heart_rate,
    bloodPressure: row.blood_pressure,
    sleepHours: row.sleep_hours,
    stressLevel: row.stress_level,
    ...Object.fromEntries(
      Object.keys(OPTIONAL_FIELDS).map((key) => [
        key,
        extras[key] ?? null,
      ])
    ),
  };
}

// Retrieve the latest saved Dashboard.
app.get("/api/dashboard", (req, res) => {
  try {
    const row = db
      .prepare(`
        SELECT *
        FROM dashboard_snapshots
        WHERE astronaut_id = 1
        ORDER BY id DESC
        LIMIT 1
      `)
      .get();

    res.json(formatDashboard(row));
  } catch (error) {
    console.error("Dashboard GET error:", error);

    res.status(500).json({
      error: "Could not retrieve dashboard data.",
    });
  }
});

// Save a complete Dashboard snapshot.
const saveDashboard = db.transaction((data) => {
  const {
    name,
    heartRate,
    bloodPressure,
    sleepHours,
    stressLevel,
    optional,
  } = data;

  const snapshotResult = db
    .prepare(`
      INSERT INTO dashboard_snapshots
      (
        astronaut_id,
        name,
        heart_rate,
        blood_pressure,
        sleep_hours,
        stress_level,
        extra_json
      )
      VALUES (1, ?, ?, ?, ?, ?, ?)
    `)
    .run(
      name,
      heartRate,
      bloodPressure,
      sleepHours,
      stressLevel,
      JSON.stringify(optional)
    );

  const insertReading = db.prepare(`
    INSERT INTO readings
    (astronaut_id, type, value, unit)
    VALUES (1, ?, ?, ?)
  `);

  // Original measurements.
  insertReading.run(
    "heart_rate",
    String(heartRate),
    "bpm"
  );

  insertReading.run(
    "blood_pressure",
    String(bloodPressure),
    "mmHg"
  );

  insertReading.run(
    "stress_level",
    String(stressLevel),
    "/10"
  );

  // Save each provided optional measurement.
  for (const [key, config] of Object.entries(
    OPTIONAL_FIELDS
  )) {
    const value = optional[key];

    if (value !== null) {
      insertReading.run(
        config.type,
        String(value),
        config.unit
      );
    }
  }

  // Preserve the existing check-in functionality.
  db.prepare(`
    INSERT INTO checkins
    (
      astronaut_id,
      mood,
      stress,
      sleep_hours
    )
    VALUES (1, ?, ?, ?)
  `).run(
    optional.mood,
    stressLevel,
    sleepHours
  );

  return snapshotResult.lastInsertRowid;
});

app.post("/api/dashboard", (req, res) => {
  const input = req.body ?? {};

  const name =
    typeof input.name === "string"
      ? input.name.trim()
      : "";

  if (!name || name.length > 50) {
    return res.status(400).json({
      error: "Please enter a valid display name.",
    });
  }

  const required = {};

  for (const [key, config] of Object.entries(
    REQUIRED_FIELDS
  )) {
    const value = input[key];

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return res.status(400).json({
        error: `${key} is required.`,
      });
    }

    const number = Number(value);

    if (
      !Number.isFinite(number) ||
      number < config.min ||
      number > config.max
    ) {
      return res.status(400).json({
        error:
          `${key} must be between ` +
          `${config.min} and ${config.max}.`,
      });
    }

    required[key] = number;
  }

  let optional;

  try {
    optional = normalizeOptionalFields(input);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  try {
    const data = {
      name,
      ...required,
      optional,
    };

    saveDashboard(data);

    res.status(201).json({
      name,
      ...required,
      ...optional,
    });
  } catch (error) {
    console.error("Dashboard POST error:", error);

    res.status(500).json({
      error: "Could not save dashboard data.",
    });
  }
});

//
// ---------- Dashboard History ----------
//

// Historical Dashboard snapshots for Physical
// and Mental Health Stats and trend graphs.

app.get("/api/dashboard/history", (req, res) => {
  try {
    const rows = db
      .prepare(`
        SELECT
          id,
          heart_rate,
          blood_pressure,
          sleep_hours,
          stress_level,
          extra_json,
          created_at
        FROM dashboard_snapshots
        WHERE astronaut_id = 1
        ORDER BY id ASC
        LIMIT 500
      `)
      .all();

    const history = rows.map((row) => {
      let extras = {};

      try {
        extras = JSON.parse(
          row.extra_json || "{}"
        );
      } catch {
        // Older records may not have
        // optional measurements.
      }

      return {
        id: row.id,
        recordedAt: row.created_at,
        heartRate: row.heart_rate,
        bloodPressure: row.blood_pressure,
        sleepHours: row.sleep_hours,
        stressLevel: row.stress_level,
        ...extras,
      };
    });

    res.json(history);
  } catch (error) {
    console.error(
      "Dashboard history error:",
      error
    );

    res.status(500).json({
      error: "Unable to retrieve history.",
    });
  }
});

// ---------- NASA space weather ----------

async function getDonki(type, startDate, endDate) {
  const key =
    process.env.NASA_API_KEY || "DEMO_KEY";

  const url =
    `https://api.nasa.gov/DONKI/${type}` +
    `?startDate=${startDate}` +
    `&endDate=${endDate}` +
    `&api_key=${key}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `DONKI ${type} returned ${response.status}`
    );
  }

  const text = await response.text();

  return text ? JSON.parse(text) : [];
}

let spaceWeatherCache = null;

app.get("/api/space-weather", async (req, res) => {
  if (
    spaceWeatherCache &&
    Date.now() - spaceWeatherCache.time <
      10 * 60 * 1000
  ) {
    return res.json(spaceWeatherCache.data);
  }

  const day = (date) =>
    date.toISOString().slice(0, 10);

  const today = new Date();

  const threeDaysAgo = new Date(
    today.getTime() - 3 * 24 * 60 * 60 * 1000
  );

  try {
    const [flares, particles] = await Promise.all([
      getDonki(
        "FLR",
        day(threeDaysAgo),
        day(today)
      ),
      getDonki(
        "SEP",
        day(threeDaysAgo),
        day(today)
      ),
    ]);

    const strongFlares = flares.filter((flare) =>
      /^[MX]/.test(flare.classType || "")
    );

    const status =
      particles.length > 0
        ? "danger"
        : strongFlares.length > 0
        ? "caution"
        : "safe";

    const data = {
      status,
      solarFlares: flares.length,
      strongFlares: strongFlares.length,
      particleEvents: particles.length,
      latestFlareClass: flares.length
        ? flares[flares.length - 1].classType
        : null,
      source: "NASA DONKI",
      checkedAt: new Date().toISOString(),
    };

    spaceWeatherCache = {
      time: Date.now(),
      data,
    };

    res.json(data);
  } catch (error) {
    res.status(502).json({
      error: "Could not reach NASA DONKI",
      details: error.message,
    });
  }
});

// ---------- NASA sleep research ----------

app.get("/api/nasa/sleep/subjects", (req, res) => {
  const subjects = db
    .prepare(`
      SELECT
        subject_id,
        COUNT(*) AS total_records
      FROM nasa_sleep_records
      GROUP BY subject_id
      ORDER BY subject_id
    `)
    .all();

  res.json(subjects);
});

app.get(
  "/api/nasa/sleep/:subjectId",
  (req, res) => {
    const records = db
      .prepare(`
        SELECT *
        FROM nasa_sleep_records
        WHERE subject_id = ?
        ORDER BY measurement_date ASC, id ASC
      `)
      .all(req.params.subjectId);

    res.json(records);
  }
);

// Chat uses the same saved measurements as the dashboard (single-user demo).
app.post('/api/analysis/chat/:astronautId', async (req, res) => {
  const astronautId = Number(req.params.astronautId);
  if (astronautId !== 1) {
    return res.status(400).json({ error: 'This demo supports astronaut 1 only.' });
  }

  const { question, history = [] } = req.body ?? {};
  if (typeof question !== 'string' || !question.trim() || question.length > 1000) {
    return res.status(400).json({ error: 'Enter a question of up to 1000 characters.' });
  }
  if (!Array.isArray(history) || history.length > 6 || history.some((message) =>
    !message || !['user', 'assistant'].includes(message.role) ||
    typeof message.text !== 'string' || message.text.length > 1000
  )) {
    return res.status(400).json({ error: 'Invalid conversation history.' });
  }
  if (!process.env.GEMINI_API_KEY?.trim()) {
    return res.status(503).json({ error: 'The assistant is not configured. Set GEMINI_API_KEY on the server and restart it.' });
  }

  try {
    const rows = db.prepare(`
      SELECT id, heart_rate, blood_pressure, sleep_hours, stress_level, created_at
      FROM dashboard_snapshots
      WHERE astronaut_id = ? AND created_at >= datetime('now', '-7 days')
      ORDER BY created_at DESC, id DESC
      LIMIT 100
    `).all(astronautId);
    const records = rows.reverse();
    const answer = await askHealthAssistant(question.trim(), {
      astronautId,
      source: 'User-entered dashboard snapshots',
      periodDays: 7,
      records,
      latestReading: records.at(-1) ?? null,
      baseline: null,
      units: { heart_rate: 'bpm', blood_pressure: 'mm Hg (single value)', sleep_hours: 'hours', stress_level: '0–10' },
      dataLimitations: [
        'No established personal baseline is available.',
        'Snapshots represent form saves, not necessarily distinct daily measurements.',
        'At most 100 snapshots from the past seven days are supplied.',
        ...(records.length ? [] : ['No saved dashboard measurements exist for this period.']),
      ],
    }, history);
    if (typeof answer !== 'string' || !answer.trim()) {
      throw new Error('Empty assistant response');
    }
    res.json({ answer });
  } catch {
    // Keep provider errors and credentials out of browser responses and logs.
    console.error('AI chat request failed.');
    res.status(502).json({ error: 'The AI provider could not return an answer. Check the server API key and model configuration, then try again.' });
  }
});

// ---------- Start server ----------

const PORT = 3001;

app.listen(PORT, () => {
  console.log(
    `AstroHealth server running at http://localhost:${PORT}`
  );
});
