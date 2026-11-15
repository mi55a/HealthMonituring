import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import db from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const filePath = path.join(
  __dirname,
  "data",
  "BRSMACT_Campagin_1_Actigraphy.csv"
);

// Convert NASA time values to minutes.
// Examples: "7:44:00" -> 464, "0:14" -> 14

function toMinutes(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const cleaned = String(value).trim();

  if (cleaned === "" || cleaned.toUpperCase() === "NA") {
    return null;
  }

  // Handle numeric values, including 0.
  // Assumes plain numeric values are expressed in hours.
  if (!cleaned.includes(":")) {
    const hours = Number(cleaned);

    if (!Number.isFinite(hours)) {
      throw new Error(`Invalid time: ${value}`);
    }

    return hours * 60;
  }

  // Handle HH:MM or HH:MM:SS
  const parts = cleaned.split(":").map(Number);

  if (
    ![2, 3].includes(parts.length) ||
    parts.some((n) => !Number.isFinite(n))
  ) {
    throw new Error(`Invalid time: ${value}`);
  }

  const [hours, minutes, seconds = 0] = parts;

  return hours * 60 + minutes + seconds / 60;
}

function toNumber(value) {
  if (!value || value.toUpperCase() === "NA") {
    return null;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`Invalid number: ${value}`);
  }

  return number;
}

// Convert MM/DD/YYYY into YYYY-MM-DD
function toDate(value) {
  const [month, day, year] = value.split("/");

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// Read NASA CSV
const csv = fs.readFileSync(filePath, "utf8");

const records = parse(csv, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  bom: true
});

// Prepare database insert
const insert = db.prepare(`
  INSERT INTO nasa_sleep_records (
    id,
    subject_id,
    test_phase,
    bed_rest_day,
    measurement_date,
    sleep_latency_minutes,
    sleep_duration_minutes,
    sleep_efficiency_percent,
    notes
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    subject_id = excluded.subject_id,
    test_phase = excluded.test_phase,
    bed_rest_day = excluded.bed_rest_day,
    measurement_date = excluded.measurement_date,
    sleep_latency_minutes = excluded.sleep_latency_minutes,
    sleep_duration_minutes = excluded.sleep_duration_minutes,
    sleep_efficiency_percent = excluded.sleep_efficiency_percent,
    notes = excluded.notes
`);

// Import all records as one transaction
const importData = db.transaction(() => {
  for (const row of records) {
    insert.run(
      Number(row.ID),
      row.Subject,
      row.Test_Phase,
      Number(row.BR_Day),
      toDate(row.Date),
      toMinutes(row["Sleep Latency (hours)"]),
      toMinutes(row["Sleep Duration (hours)"]),
      toNumber(row["Sleep Efficiency (%)"]),
      row.Notes === "NA" ? null : row.Notes
    );
  }
});

importData();

console.log(`Successfully imported ${records.length} NASA sleep records!`);

const count = db.prepare(`
  SELECT COUNT(*) AS total FROM nasa_sleep_records
`).get();

console.log(`Total NASA sleep records in database: ${count.total}`);

db.close();