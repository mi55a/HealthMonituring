import { useEffect, useMemo, useState } from "react";
import "./NASASleepData.css";

const API = "http://localhost:3001";

function SleepChart({ records, field, title, color, unit }) {
  const [hovered, setHovered] = useState(null);

  const points = records
    .filter(
      (record) =>
        record[field] != null &&
        Number.isFinite(Number(record[field]))
    )
    .map((record) => ({
      label: record.measurement_date,
      value: Number(record[field]),
    }));

  if (!points.length) {
    return (
      <div className="nasa-chart">
        <h3>{title}</h3>
        <p>No measurements available.</p>
      </div>
    );
  }

  const width = 700;
  const height = 230;
  const left = 48;
  const right = 16;
  const top = 20;
  const bottom = 35;

  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const max =
    Math.max(1, ...points.map((point) => point.value)) * 1.1;

  const coordinates = points.map((point, index) => ({
    ...point,
    x:
      left +
      (index / Math.max(1, points.length - 1)) *
        plotWidth,
    y:
      top +
      plotHeight -
      (point.value / max) * plotHeight,
  }));

  const line = coordinates
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <div className="nasa-chart">
      <h3>{title}</h3>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={title}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y =
            top + plotHeight * (1 - fraction);

          return (
            <g key={fraction}>
              <line
                x1={left}
                y1={y}
                x2={width - right}
                y2={y}
                stroke="#e6def5"
                strokeDasharray="4 4"
              />

              <text
                x={left - 8}
                y={y + 4}
                textAnchor="end"
                fill="#74658f"
                fontSize="11"
              >
                {(max * fraction).toFixed(0)}
              </text>
            </g>
          );
        })}

        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {coordinates.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={color}
            stroke="white"
            strokeWidth="1.5"
            tabIndex={0}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(null)}
          >
            <title>
              {point.label}: {point.value.toFixed(1)} {unit}
            </title>
          </circle>
        ))}
      </svg>

      <p className="nasa-chart-detail" aria-live="polite">
        {hovered !== null && coordinates[hovered]
          ? `${coordinates[hovered].label}: ${coordinates[
              hovered
            ].value.toFixed(1)} ${unit}`
          : "Hover over a point to view its measurement."}
      </p>
    </div>
  );
}

export default function NASASleepData() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API}/api/nasa/sleep/subjects`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load research subjects.");
        }

        return response.json();
      })
      .then((data) => {
        setSubjects(data);

        if (data.length > 0) {
          setSelectedSubject(data[0].subject_id);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;

    const controller = new AbortController();

    setLoading(true);
    setError("");
    setRecords([]);

    fetch(
      `${API}/api/nasa/sleep/${encodeURIComponent(
        selectedSubject
      )}`,
      { signal: controller.signal }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load sleep records.");
        }

        return response.json();
      })
      .then(setRecords)
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedSubject]);

  const averageSleep = useMemo(() => {
    const durations = records
      .map((record) => record.sleep_duration_minutes)
      .filter(
        (value) =>
          value != null &&
          Number.isFinite(Number(value))
      )
      .map(Number);

    if (!durations.length) return "N/A";

    const average =
      durations.reduce((sum, value) => sum + value, 0) /
      durations.length /
      60;

    return average.toFixed(2);
  }, [records]);

  const durationRecords = records.map((record) => ({
    ...record,
    duration_hours:
      record.sleep_duration_minutes == null
        ? null
        : record.sleep_duration_minutes / 60,
  }));

  return (
    <section className="nasa-sleep">
      <div className="nasa-sleep__heading">
        <div>
          <h2>NASA Sleep Research</h2>

          <p>
            Historical bed-rest analog research, not live
            astronaut health measurements.
          </p>
        </div>

        <label>
          Research subject

          <select
            value={selectedSubject}
            onChange={(event) =>
              setSelectedSubject(event.target.value)
            }
          >
            {subjects.map((subject) => (
              <option
                key={subject.subject_id}
                value={subject.subject_id}
              >
                {subject.subject_id} (
                {subject.total_records} records)
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <p role="status">
          Loading NASA sleep data...
        </p>
      )}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && (
        <>
          {/* Research summary */}
          <div className="nasa-sleep__stats">
            <div>
              <span>Average sleep duration</span>

              <strong>
                {averageSleep}
                {averageSleep === "N/A"
                  ? ""
                  : " hours"}
              </strong>
            </div>

            <div>
              <span>Research records</span>

              <strong>{records.length}</strong>
            </div>
          </div>

          {/* Sleep research graphs */}
          <div className="nasa-charts">
            <SleepChart
              records={durationRecords}
              field="duration_hours"
              title="Sleep Duration Over Time"
              color="#8457d6"
              unit="hours"
            />

            <SleepChart
              records={records}
              field="sleep_efficiency_percent"
              title="Sleep Efficiency Over Time"
              color="#22a7a0"
              unit="%"
            />
          </div>
        </>
      )}
    </section>
  );
}
