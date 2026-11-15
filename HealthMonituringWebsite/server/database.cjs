
const Database = require("better-sqlite3");

const db = new Database("server/astrohealth.db");

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS health_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    astronaut_id INTEGER NOT NULL,
    heart_rate REAL,
    sleep_hours REAL,
    oxygen_level REAL,
    stress_level REAL,
    temperature REAL,
    blood_pressure TEXT,
    activity_minutes INTEGER,
    recorded_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS medical_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    astronaut_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert fictional demo readings when the database is empty.
const count = db.prepare(`
  SELECT COUNT(*) AS total FROM health_records
`).get();

if (count.total === 0) {
  const insert = db.prepare(`
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
  `);

  const demoReadings = [
    [76, 7.4, 99, 35, 36.7, "120/80", 50],
    [78, 7.0, 99, 40, 36.8, "121/80", 45],
    [79, 6.8, 98, 45, 36.8, "121/81", 40],
    [80, 6.2, 98, 55, 36.9, "122/81", 35],
    [82, 5.2, 98, 72, 37.0, "123/82", 30]
  ];

  const insertDemoData = db.transaction(() => {
    demoReadings.forEach((reading, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (4 - index));

      insert.run(
        1,
        ...reading,
        date.toISOString()
      );
    });
  });

  insertDemoData();
}

module.exports = db;
