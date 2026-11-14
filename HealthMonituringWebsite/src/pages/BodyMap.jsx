import { useState } from "react";
import "./BodyMap.css";

const REGIONS = {
  brain: {
    title: "Brain & mind", status: "warning",
    does: "Controls attention, memory, mood and sleep.",
    space: "Isolation and a broken day–night cycle (a sunrise every 90 minutes on the station) wear down sleep and mood.",
    readings: [["Sleep", "6.1 h"], ["Mood", "3 / 5"], ["Stress", "3 / 5"]],
    actions: ["Use bright light in the morning and dim light before bed.", "Schedule a private call with home."],
  },
  eyes: {
    title: "Eyes & head", status: "healthy",
    does: "Your eyes and the pressure inside your head decide how clearly you see.",
    space: "Fluid shifts toward the head and can swell the back of the eye, changing vision (SANS).",
    readings: [["Vision check", "No change"]],
    actions: ["Do your weekly vision self-check."],
  },
  ear: {
    title: "Inner ear & balance", status: "healthy",
    does: "Senses motion and which way is down.",
    space: "In the first days of weightlessness, the inner ear and eyes disagree and cause motion sickness.",
    readings: [["Nausea", "None"], ["Dizziness", "None"]],
    actions: ["No action needed."],
  },
  lungs: {
    title: "Lungs & cabin air", status: "healthy",
    does: "Bring oxygen into the blood and remove carbon dioxide.",
    space: "In a sealed cabin, CO₂ can build up and cause headaches and poor sleep.",
    readings: [["Oxygen level", "97%"]],
    actions: ["No action needed."],
  },
  heart: {
    title: "Heart & circulation", status: "healthy",
    does: "Pumps blood, oxygen and nutrients around your body.",
    space: "Fluid shifts toward the head, the heart works less, and crews can feel faint back in gravity.",
    readings: [["Heart rate", "78 bpm"], ["Blood pressure", "112/72"]],
    actions: ["Keep your cardio exercise schedule."],
  },
  gut: {
    title: "Immune & metabolism", status: "warning",
    does: "Fights infection and keeps blood sugar steady.",
    space: "Radiation, stress and poor sleep weaken some immune defences.",
    readings: [["Temperature", "37.3 °C"], ["Blood sugar", "95 mg/dL"]],
    actions: ["Rest and drink extra fluids.", "Measure your temperature again in 4 hours."],
  },
  kidneys: {
    title: "Kidneys & hydration", status: "healthy",
    does: "Filter blood and balance water and minerals.",
    space: "Calcium from shrinking bones raises the risk of kidney stones.",
    readings: [["Water intake", "2.0 L"]],
    actions: ["Keep drinking about 2 litres a day."],
  },
  bones: {
    title: "Bones & muscle", status: "healthy",
    does: "Hold you up and let you move and work.",
    space: "Hips and spine can lose about 1–1.5% of bone mass per month without exercise.",
    readings: [["Exercise", "120 min"]],
    actions: ["Target met. Keep up resistance exercise."],
  },
  rad: {
    title: "Radiation exposure", status: "healthy",
    does: "Radiation affects every cell; the main long-term risk is cancer.",
    space: "Above Earth's atmosphere, crews get a steady dose from cosmic rays plus bursts from solar storms.",
    readings: [["Dose today", "0.49 mSv"]],
    actions: ["Dose is at the expected level for the station."],
  },
};

const STATUS_LABEL = { healthy: "Healthy", warning: "Warning", critical: "Critical" };

export default function BodyMap() {
  const [selected, setSelected] = useState("heart");
  const region = REGIONS[selected];

  const cls = (key) =>
    `region ${REGIONS[key].status} ${selected === key ? "selected" : ""}`;

  return (
    <div className="bodymap-page">
      {/* Top bar (replace with your team's shared header later) */}
      <header className="bm-topbar">
        <span className="bm-gear" aria-hidden="true">⚙</span>
        <span className="bm-brand">AstroHealth</span>
      </header>
      <nav className="bm-nav">
        <button type="button" className="bm-profile">MY PROFILE ▾</button>
        <span className="bm-tab">Body Map</span>
      </nav>

      <main className="bm-main">
        <h1 className="bm-title">Body Status</h1>

        <div className="bm-layout">
          {/* Figure card */}
          <div className="bm-figure-card">
            <svg viewBox="0 0 300 560" className="bm-figure" aria-label="Body map">
              <ellipse
                className={`halo ${REGIONS.rad.status} ${selected === "rad" ? "selected" : ""}`}
                cx="150" cy="284" rx="140" ry="272"
                onClick={() => setSelected("rad")}
              />
              <rect className="body-outline" x="138" y="96" width="24" height="26" rx="6" />
              <path className="body-outline"
                d="M96 122 Q150 110 204 122 L214 210 Q212 290 196 316 L104 316 Q88 290 86 210 Z" />

              <g className={cls("bones")} onClick={() => setSelected("bones")}>
                <path d="M96 126 Q74 130 68 154 L52 280 Q49 298 62 300 Q74 301 76 286 L98 176 Z" />
                <path d="M204 126 Q226 130 232 154 L248 280 Q251 298 238 300 Q226 301 224 286 L202 176 Z" />
                <path d="M108 314 L146 314 L141 512 Q140 530 124 530 Q109 530 110 512 Z" />
                <path d="M154 314 L192 314 L190 512 Q191 530 176 530 Q160 530 159 512 Z" />
              </g>
              <circle className={cls("brain")} cx="150" cy="60" r="38" onClick={() => setSelected("brain")} />
              <g className={cls("ear")} onClick={() => setSelected("ear")}>
                <ellipse cx="108" cy="66" rx="8" ry="13" />
                <ellipse cx="192" cy="66" rx="8" ry="13" />
              </g>
              <g className={cls("eyes")} onClick={() => setSelected("eyes")}>
                <rect x="122" y="56" width="56" height="22" rx="11" />
                <circle className="pupil" cx="137" cy="67" r="3.5" />
                <circle className="pupil" cx="163" cy="67" r="3.5" />
              </g>
              <g className={cls("lungs")} onClick={() => setSelected("lungs")}>
                <path d="M118 138 Q100 148 98 190 Q98 224 122 226 Q140 226 141 200 L141 146 Q132 134 118 138 Z" />
                <path d="M182 138 Q200 148 202 190 Q202 224 178 226 Q160 226 159 200 L159 146 Q168 134 182 138 Z" />
              </g>
              <path className={cls("heart")} onClick={() => setSelected("heart")}
                d="M146 212 C122 197 124 174 137 174 C142 174 146 178 146 183 C146 178 150 174 155 174 C168 174 170 197 146 212 Z" />
              <rect className={cls("gut")} onClick={() => setSelected("gut")}
                x="122" y="236" width="56" height="70" rx="22" />
              <g className={cls("kidneys")} onClick={() => setSelected("kidneys")}>
                <ellipse cx="104" cy="262" rx="10" ry="18" />
                <ellipse cx="196" cy="262" rx="10" ry="18" />
              </g>
            </svg>
          </div>

          {/* Region buttons */}
          <div className="bm-region-list">
            {Object.entries(REGIONS).map(([key, r]) => (
              <button
                key={key}
                type="button"
                className={selected === key ? "active" : ""}
                onClick={() => setSelected(key)}
              >
                <span className={`bm-dot ${r.status}`} />
                <span className="name">{r.title}</span>
              </button>
            ))}
          </div>

          {/* Info panel */}
          <section className="bm-panel">
            <div className="bm-panel-head">
              <h2>{region.title}</h2>
              <span className={`bm-pill ${region.status}`}>{STATUS_LABEL[region.status]}</span>
            </div>

            <div className="bm-panel-body">
              <div className="bm-readings">
                {region.readings.map(([label, value]) => (
                  <div className="bm-reading" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>

              <h3>What it does</h3>
              <p>{region.does}</p>

              <h3>How spaceflight affects it</h3>
              <p>{region.space}</p>

              <div className="bm-todo">
                <h3>What to do now</h3>
                <ul>
                  {region.actions.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>

              <div className="bm-buttons">
                <button type="button" className="bm-btn">See Trends</button>
              </div>
            </div>
          </section>
        </div>

        <div className="bm-legend">
          <span><span className="bm-dot healthy" /> Healthy</span>
          <span><span className="bm-dot warning" /> Warning</span>
          <span><span className="bm-dot critical" /> Critical</span>
          <span>Dashed outline: radiation</span>
        </div>
      </main>
    </div>
  );
}