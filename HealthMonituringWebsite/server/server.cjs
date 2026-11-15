require("dotenv").config({ path: "server/.env" });

const express = require("express");
const cors = require("cors");

const db = require("./database.cjs");

const {
  analyzeHealth,
  askHealthAssistant
} = require("./ai.cjs");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174"
  ]
}));

app.use(express.json({ limit: "20kb" }));

// Validate astronaut ID.
function validAstronautId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Accept only the date ranges supported by the wireframe.
function getDays(value) {
  const days = Number(value || 7);
  return [1, 7, 14, 30].includes(days) ? days : 7;
}

// Retrieve health readings for a selected period.
function getRecords(astronautId, days) {
  const startDate = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  return db.prepare(`
    SELECT *
    FROM health_records
    WHERE astronaut_id = ?
      AND recorded_at >= ?
    ORDER BY recorded_at ASC
  `).all(astronautId, startDate);
}

// Calculate averages.
function getAverage(records, field) {
  const values = records
    .map(record => record[field])
    .filter(value => value !== null && value !== undefined);

  if (values.length === 0) return null;

  const total = values.reduce((sum, value) => sum + value, 0);

  return Number((total / values.length).toFixed(1));
}

// Calculate the personal baseline from earlier readings.
function getBaseline(astronautId, days) {
  const cutoff = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000
  ).toISOString();

  const records = db.prepare(`
    SELECT *
    FROM health_records
    WHERE astronaut_id = ?
      AND recorded_at < ?
    ORDER BY recorded_at DESC
    LIMIT 30
  `).all(astronautId, cutoff);

  return {
    heart_rate: getAverage(records, "heart_rate"),
    sleep_hours: getAverage(records, "sleep_hours"),
    oxygen_level: getAverage(records, "oxygen_level"),
    stress_level: getAverage(records, "stress_level"),
    sampleCount: records.length
  };
}

// Compare latest measurements with the baseline.
function getComparisons(latest, baseline) {
  const fields = [
    "heart_rate",
    "sleep_hours",
    "oxygen_level",
    "stress_level"
  ];

  const comparisons = {};

  fields.forEach(field => {
    const current = latest ? latest[field] : null;
    const previous = baseline[field];

    comparisons[field] = {
      current,
      baseline: previous,
      difference:
        current !== null && previous !== null
          ? Number((current - previous).toFixed(1))
          : null
    };
  });

  return comparisons;
}

// Backend test.
app.get("/api", (req, res) => {
  res.json({
    message: "ASTROHEALTH AI Analysis backend is running!"
  });
});

// Health overview for cards and status sections.
app.get("/api/analysis/overview/:astronautId", (req, res) => {
  const astronautId = validAstronautId(req.params.astronautId);

  if (!astronautId) {
    return res.status(400).json({
      error: "Invalid astronaut ID."
    });
  }

  const days = getDays(req.query.days);
  const records = getRecords(astronautId, days);
  const latest = records[records.length - 1] || null;
  const baseline = getBaseline(astronautId, days);

  res.json({
    astronautId,
    days,
    latestReading: latest,
    averages: {
      heart_rate: getAverage(records, "heart_rate"),
      sleep_hours: getAverage(records, "sleep_hours"),
      oxygen_level: getAverage(records, "oxygen_level"),
      stress_level: getAverage(records, "stress_level")
    },
    baseline,
    comparisons: getComparisons(latest, baseline),
    recordCount: records.length
  });
});

// Historical data for charts.
app.get("/api/analysis/trends/:astronautId", (req, res) => {
  const astronautId = validAstronautId(req.params.astronautId);

  if (!astronautId) {
    return res.status(400).json({
      error: "Invalid astronaut ID."
    });
  }

  const days = getDays(req.query.days);
  const records = getRecords(astronautId, days);

  res.json({
    astronautId,
    days,
    trends: records.map(record => ({
      date: record.recorded_at,
      heart_rate: record.heart_rate,
      sleep_hours: record.sleep_hours,
      oxygen_level: record.oxygen_level,
      stress_level: record.stress_level
    }))
  });
});

// Save a new health measurement.
app.post("/api/analysis/records", (req, res) => {
  const {
    astronaut_id,
    heart_rate,
    sleep_hours,
    oxygen_level,
    stress_level,
    temperature,
    blood_pressure,
    activity_minutes
  } = req.body;

  const astronautId = validAstronautId(astronaut_id);

  if (!astronautId) {
    return res.status(400).json({
      error: "Valid astronaut ID is required."
    });
  }

  const numericFields = {
    heart_rate,
    sleep_hours,
    oxygen_level,
    stress_level,
    temperature,
    activity_minutes
  };

  for (const [field, value] of Object.entries(numericFields)) {
    if (
      value !== undefined &&
      value !== null &&
      (typeof value !== "number" || !Number.isFinite(value))
    ) {
      return res.status(400).json({
        error: `${field} must be a valid number.`
      });
    }
  }

  const result = db.prepare(`
    INSERT INTO health_records (
      astronaut_id,
      heart_rate,
      sleep_hours,
      oxygen_level,
      stress_level,
      temperature,
      blood_pressure,
      activity_minutes,
      recorded_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    astronautId,
    heart_rate ?? null,
    sleep_hours ?? null,
    oxygen_level ?? null,
    stress_level ?? null,
    temperature ?? null,
    blood_pressure ?? null,
    activity_minutes ?? null,
    new Date().toISOString()
  );

  res.status(201).json({
    message: "Health reading saved.",
    id: result.lastInsertRowid
  });
});

// Gemini-powered health analysis.
app.post("/api/analysis/analyze/:astronautId", async (req, res) => {
  try {
    const astronautId = validAstronautId(req.params.astronautId);

    if (!astronautId) {
      return res.status(400).json({
        error: "Invalid astronaut ID."
      });
    }

    const days = getDays(req.body.days);
    const records = getRecords(astronautId, days);

    if (records.length === 0) {
      return res.status(404).json({
        error: "No health readings available for this period."
      });
    }

    const baseline = getBaseline(astronautId, days);
    const latest = records[records.length - 1];

    const averages = {
      heart_rate: getAverage(records, "heart_rate"),
      sleep_hours: getAverage(records, "sleep_hours"),
      oxygen_level: getAverage(records, "oxygen_level"),
      stress_level: getAverage(records, "stress_level")
    };

    const analysis = await analyzeHealth({
      astronautId,
      periodDays: days,
      latestReading: latest,
      averages,
      baseline,
      comparisons: getComparisons(latest, baseline),
      records
    });

    res.json({
      astronautId,
      days,
      generatedAt: new Date().toISOString(),
      analysis
    });
  } catch (error) {
    console.error("Gemini analysis error:", error);

    res.status(500).json({
      error: "Unable to generate AI health analysis. Check your API key and server logs."
    });
  }
});

// AI Assistant chat.
app.post("/api/analysis/chat/:astronautId", async (req, res) => {
  try {
    const astronautId = validAstronautId(req.params.astronautId);
    const { question, history } = req.body;

    if (!astronautId) {
      return res.status(400).json({
        error: "Invalid astronaut ID."
      });
    }

    if (
      typeof question !== "string" ||
      question.trim().length === 0 ||
      question.length > 1000
    ) {
      return res.status(400).json({
        error: "Enter a question of up to 1000 characters."
      });
    }

    const records = getRecords(astronautId, 7);
    const baseline = getBaseline(astronautId, 7);

    const answer = await askHealthAssistant(
      question.trim(),
      { astronautId, records, baseline },
      Array.isArray(history) ? history.slice(-6) : []
    );

    res.json({ answer });
  } catch (error) {
    console.error("Gemini chat error:", error);

    res.status(500).json({
      error: "Unable to answer your question. Check your API key and server logs."
    });
  }
});

// Health report data for the Share Health Data section.
app.get("/api/analysis/report/:astronautId", (req, res) => {
  const astronautId = validAstronautId(req.params.astronautId);

  if (!astronautId) {
    return res.status(400).json({
      error: "Invalid astronaut ID."
    });
  }

  const days = getDays(req.query.days);
  const records = getRecords(astronautId, days);
  const baseline = getBaseline(astronautId, days);

  res.json({
    title: "ASTROHEALTH Health Report",
    astronautId,
    generatedAt: new Date().toISOString(),
    periodDays: days,
    readings: records,
    baseline,
    averages: {
      heart_rate: getAverage(records, "heart_rate"),
      sleep_hours: getAverage(records, "sleep_hours"),
      oxygen_level: getAverage(records, "oxygen_level"),
      stress_level: getAverage(records, "stress_level")
    }
  });
});

// Submit a request for medical review.
app.post("/api/analysis/medical-review", (req, res) => {
  const { astronaut_id, reason } = req.body;
  const astronautId = validAstronautId(astronaut_id);

  if (
    !astronautId ||
    typeof reason !== "string" ||
    reason.trim().length === 0 ||
    reason.length > 1000
  ) {
    return res.status(400).json({
      error: "A valid astronaut ID and reason are required."
    });
  }

  const result = db.prepare(`
    INSERT INTO medical_reviews (astronaut_id, reason)
    VALUES (?, ?)
  `).run(astronautId, reason.trim());

  res.status(201).json({
    message: "Medical review request recorded.",
    requestId: result.lastInsertRowid,
    status: "pending"
  });
});

// Handle unexpected errors.
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    error: "An unexpected server error occurred."
  });
});

app.listen(PORT, () => {
  console.log(`ASTROHEALTH backend running at http://localhost:${PORT}`);
});