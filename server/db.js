import Database from "better-sqlite3";

// Creates astrohealth.db in this folder the first time it runs
const db = new Database("astrohealth.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    astronaut_id INTEGER NOT NULL DEFAULT 1,
    type TEXT NOT NULL,          -- 'heart_rate', 'blood_pressure', 'temperature'...
    value TEXT NOT NULL,         -- '78' or '112/72'
    unit TEXT,                   -- 'bpm', 'mmHg', '°C'
    recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS checkins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    astronaut_id INTEGER NOT NULL DEFAULT 1,
    mood INTEGER,                -- 1 to 5
    stress INTEGER,              -- 1 to 5
    sleep_hours REAL,
    symptoms TEXT,               -- comma-separated, e.g. 'headache,nausea'
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  
  CREATE TABLE IF NOT EXISTS nasa_sleep_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_id TEXT NOT NULL,
  test_phase TEXT,
  bed_rest_day INTEGER,
  measurement_date TEXT,
  sleep_latency_minutes REAL,
  sleep_duration_minutes REAL,
  sleep_efficiency_percent REAL,
  notes TEXT
);
`);

export default db;