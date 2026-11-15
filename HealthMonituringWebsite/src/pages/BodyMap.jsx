
import { useCallback, useEffect, useState } from "react";
import ProfileDropdown from "./ProfileDropdown";
import NASASleepData from "../NASASleepData.jsx";

import "./WelcomePage.css";
import "./BodyMap.css";
import "../NASASleepData.css";

const API = "http://localhost:3001";

const REGIONS = {
  brain: {
    title: "Brain & mind",
    does: "Controls attention, memory, mood and sleep.",
    space:
      "Isolation and a disrupted day-night cycle can affect sleep and mood.",
    readings: [
      ["Sleep", "sleepHours", "h"],
      ["Mood", "mood", "/5"],
      ["Stress", "stressLevel", "/10"],
    ],
  },

  eyes: {
    title: "Eyes & head",
    does: "Supports vision and visual processing.",
    space:
      "Fluid shifts during spaceflight can affect vision.",
    readings: [
      ["Vision check", "visionCheck", ""],
    ],
  },

  ear: {
    title: "Inner ear & balance",
    does: "Helps maintain balance and spatial orientation.",
    space:
      "Weightlessness can affect balance and orientation.",
    readings: [
      ["Nausea", "nausea", "/10"],
      ["Dizziness", "dizziness", "/10"],
    ],
  },

  lungs: {
    title: "Lungs & cabin air",
    does: "Supplies oxygen and removes carbon dioxide.",
    space:
      "Cabin air quality can influence respiratory health.",
    readings: [
      ["Oxygen level", "oxygenLevel", "%"],
    ],
  },

  heart: {
    title: "Heart & circulation",
    does: "Circulates blood and oxygen throughout the body.",
    space:
      "Microgravity changes cardiovascular function.",
    readings: [
      ["Heart rate", "heartRate", "bpm"],
      ["Blood pressure", "bloodPressure", "mmHg"],
    ],
  },

  gut: {
    title: "Immune & metabolism",
    does: "Supports immune and metabolic function.",
    space:
      "Spaceflight can affect immune responses.",
    readings: [
      ["Temperature", "temperature", "°C"],
      ["Blood sugar", "bloodSugar", "mg/dL"],
    ],
  },

  kidneys: {
    title: "Kidneys & hydration",
    does: "Regulates fluid and mineral balance.",
    space:
      "Fluid shifts can affect hydration and kidney health.",
    readings: [
      ["Water intake", "waterIntake", "L"],
    ],
  },

  bones: {
    title: "Bones & muscle",
    does: "Supports movement and physical strength.",
    space:
      "Microgravity can contribute to bone and muscle loss.",
    readings: [
      ["Exercise", "exercise", "min"],
    ],
  },

  rad: {
    title: "Radiation exposure",
    does: "Tracks radiation exposure.",
    space:
      "Astronauts experience greater radiation exposure outside Earth's atmosphere.",
    readings: [
      ["Radiation dose", "radiationDose", "mSv"],
    ],
  },
};

export default function BodyMap() {
  const [selected, setSelected] = useState("brain");
  const [showSleepResearch, setShowSleepResearch] =
    useState(false);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the latest saved Dashboard data.
  const fetchHealthData = useCallback(async () => {
    try {
      const response = await fetch(
        `${API}/api/dashboard`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to retrieve health measurements."
        );
      }

      const savedData = await response.json();

      setDashboardData(savedData);
      setError("");
    } catch (err) {
      console.error("Body Map fetch error:", err);

      setError(
        "Could not load health measurements. Make sure the backend is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when the page opens and refresh when
  // the browser tab becomes active.
  useEffect(() => {
    fetchHealthData();

    const handleFocus = () => {
      fetchHealthData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchHealthData();
      }
    };

    window.addEventListener("focus", handleFocus);

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener("focus", handleFocus);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [fetchHealthData]);

  // Check whether a measurement has been recorded.
  function hasValue(field) {
    const value = dashboardData?.[field];

    return (
      value !== null &&
      value !== undefined &&
      value !== ""
    );
  }

  // Format saved health measurements.
  function getReading(field, unit) {
    if (!dashboardData) {
      return "No data recorded";
    }

    if (field === "bloodPressure") {
      const systolic = dashboardData.bloodPressure;
      const diastolic = dashboardData.diastolic;

      if (!hasValue("bloodPressure")) {
        return "No data recorded";
      }

      if (hasValue("diastolic")) {
        return `${systolic}/${diastolic} mmHg`;
      }

      return `${systolic} mmHg`;
    }

    if (!hasValue(field)) {
      return "No data recorded";
    }

    const value = dashboardData[field];

    return `${value}${unit ? ` ${unit}` : ""}`;
  }

  // Determine data availability for a body region.
  function getRegionStatus(regionKey) {
    if (loading) return "Loading...";
    if (error) return "Unavailable";

    const region = REGIONS[regionKey];

    const fields = region.readings.map(
      ([, field]) => field
    );

    const recorded = fields.filter((field) =>
      hasValue(field)
    ).length;

    if (recorded === 0) {
      return "No data";
    }

    if (recorded < fields.length) {
      return "Partial data";
    }

    return "Data recorded";
  }

  // Get a CSS status class.
  function getStatusClass(regionKey) {
    const status = getRegionStatus(regionKey);

    if (status === "Data recorded") {
      return "safe";
    }

    if (status === "Partial data") {
      return "caution";
    }

    return "unknown";
  }

  // Get measurement status description.
  function getStatusDescription(regionKey) {
    const status = getRegionStatus(regionKey);

    if (status === "Data recorded") {
      return (
        "All measurements for this body system have " +
        "been recorded successfully. This does not " +
        "indicate a medical assessment."
      );
    }

    if (status === "Partial data") {
      return (
        "Some measurements are available. Complete " +
        "the remaining fields in your Dashboard."
      );
    }

    if (status === "Loading...") {
      return "Loading your saved health measurements...";
    }

    if (status === "Unavailable") {
      return "Health measurements are currently unavailable.";
    }

    return (
      "No measurements have been recorded for this " +
      "body system yet. Enter them in your Dashboard."
    );
  }

  // Select a body region.
  function selectRegion(key) {
    setSelected(key);
    setShowSleepResearch(false);
  }

  const region = REGIONS[selected];

  // Body diagram styling.
  const regionClass = (key) =>
    `region ${getStatusClass(key)} ${
      selected === key ? "selected" : ""
    }`;

  return (
    <div className="bodymap-page">
      {/* Profile navigation */}
      <div className="bm-toprow">
        <ProfileDropdown />

        <span className="bm-alerts">
          HEALTH DATA
        </span>
      </div>

      <main className="bm-main">
        <h1 className="bm-title">
          Body <span>Status</span>
        </h1>

        <p className="bm-subtitle">
          Select a body system to view your saved
          health measurements.
        </p>

        {error && (
          <p
            role="alert"
            style={{
              color: "#b42318",
              marginBottom: "16px",
            }}
          >
            {error}
          </p>
        )}

        <div className="bm-layout">
          {/* Interactive body diagram */}
          <div className="bm-figure-card">
            <svg
              viewBox="0 0 300 560"
              className="bm-figure"
              aria-label="Interactive body map"
            >
              {/* Radiation halo */}
              <ellipse
                className={`halo ${getStatusClass("rad")} ${
                  selected === "rad" ? "selected" : ""
                }`}
                cx="150"
                cy="284"
                rx="140"
                ry="272"
                onClick={() => selectRegion("rad")}
              />

              {/* Neck */}
              <rect
                className="body-outline"
                x="138"
                y="96"
                width="24"
                height="26"
                rx="6"
              />

              {/* Torso */}
              <path
                className="body-outline"
                d="M96 122 Q150 110 204 122 L214 210 Q212 290 196 316 L104 316 Q88 290 86 210 Z"
              />

              {/* Arms and legs */}
              <g
                className={regionClass("bones")}
                onClick={() => selectRegion("bones")}
              >
                <path d="M96 126 Q74 130 68 154 L52 280 Q49 298 62 300 Q74 301 76 286 L98 176 Z" />

                <path d="M204 126 Q226 130 232 154 L248 280 Q251 298 238 300 Q226 301 224 286 L202 176 Z" />

                <path d="M108 314 L146 314 L141 512 Q140 530 124 530 Q109 530 110 512 Z" />

                <path d="M154 314 L192 314 L190 512 Q191 530 176 530 Q160 530 159 512 Z" />
              </g>

              {/* Brain */}
              <circle
                className={regionClass("brain")}
                cx="150"
                cy="60"
                r="38"
                onClick={() => selectRegion("brain")}
              />

              {/* Inner ear */}
              <g
                className={regionClass("ear")}
                onClick={() => selectRegion("ear")}
              >
                <ellipse
                  cx="108"
                  cy="66"
                  rx="8"
                  ry="13"
                />

                <ellipse
                  cx="192"
                  cy="66"
                  rx="8"
                  ry="13"
                />
              </g>

              {/* Eyes */}
              <g
                className={regionClass("eyes")}
                onClick={() => selectRegion("eyes")}
              >
                <rect
                  x="122"
                  y="56"
                  width="56"
                  height="22"
                  rx="11"
                />

                <circle
                  className="pupil"
                  cx="137"
                  cy="67"
                  r="3.5"
                />

                <circle
                  className="pupil"
                  cx="163"
                  cy="67"
                  r="3.5"
                />
              </g>

              {/* Lungs */}
              <g
                className={regionClass("lungs")}
                onClick={() => selectRegion("lungs")}
              >
                <path d="M118 138 Q100 148 98 190 Q98 224 122 226 Q140 226 141 200 L141 146 Q132 134 118 138 Z" />

                <path d="M182 138 Q200 148 202 190 Q202 224 178 226 Q160 226 159 200 L159 146 Q168 134 182 138 Z" />
              </g>

              {/* Heart */}
              <path
                className={regionClass("heart")}
                onClick={() => selectRegion("heart")}
                d="M146 212 C122 197 124 174 137 174 C142 174 146 178 146 183 C146 178 150 174 155 174 C168 174 170 197 146 212 Z"
              />

              {/* Immune and metabolism */}
              <rect
                className={regionClass("gut")}
                onClick={() => selectRegion("gut")}
                x="122"
                y="236"
                width="56"
                height="70"
                rx="22"
              />

              {/* Kidneys */}
              <g
                className={regionClass("kidneys")}
                onClick={() => selectRegion("kidneys")}
              >
                <ellipse
                  cx="104"
                  cy="262"
                  rx="10"
                  ry="18"
                />

                <ellipse
                  cx="196"
                  cy="262"
                  rx="10"
                  ry="18"
                />
              </g>
            </svg>
          </div>

          {/* Body region buttons */}
          <div className="bm-region-list">
            {Object.entries(REGIONS).map(
              ([key, item]) => (
                <button
                  key={key}
                  type="button"
                  className={
                    selected === key ? "active" : ""
                  }
                  onClick={() => selectRegion(key)}
                >
                  <span
                    className={`bm-dot ${getStatusClass(key)}`}
                  />

                  <span className="name">
                    {item.title}
                  </span>
                </button>
              )
            )}
          </div>

          {/* Selected body region */}
          <section className="bm-panel">
            <div className="bm-panel-head">
              <h2>{region.title}</h2>

              <span
                className={`bm-pill ${getStatusClass(selected)}`}
              >
                {getRegionStatus(selected)}
              </span>
            </div>

            <div className="bm-panel-body">
              {/* Database measurements */}
              <div className="bm-readings">
                {region.readings.map(
                  ([label, field, unit]) => (
                    <div
                      className="bm-reading"
                      key={label}
                    >
                      <span>{label}</span>

                      <strong>
                        {loading
                          ? "Loading..."
                          : error
                          ? "Unavailable"
                          : getReading(field, unit)}
                      </strong>
                    </div>
                  )
                )}
              </div>

              <h3>What it does</h3>
              <p>{region.does}</p>

              <h3>How spaceflight affects it</h3>
              <p>{region.space}</p>

              <div className="bm-todo">
                <h3>Measurement Status</h3>

                <p>
                  {getStatusDescription(selected)}
                </p>
              </div>

              <div className="bm-buttons">
                <button
                  type="button"
                  className="bm-btn"
                  disabled={selected !== "brain"}
                  onClick={() =>
                    setShowSleepResearch(
                      (previous) => !previous
                    )
                  }
                >
                  {selected === "brain" &&
                  showSleepResearch
                    ? "Hide Sleep Research"
                    : "See Trends"}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* NASA sleep research */}
        {selected === "brain" &&
          showSleepResearch && (
            <div className="bm-sleep-research">
              <NASASleepData />
            </div>
          )}

        {/* Status legend */}
        <div className="bm-legend">
          <span>
            <span className="bm-dot safe" />
            Data recorded
          </span>

          <span>
            <span className="bm-dot caution" />
            Partial data
          </span>

          <span>
            <span className="bm-dot unknown" />
            No data
          </span>

          <span>
            Dashed outline: radiation
          </span>
        </div>
      </main>
    </div>
  );
}
