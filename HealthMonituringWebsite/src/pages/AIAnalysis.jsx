import { useEffect, useMemo, useRef, useState } from "react";
import ProfileDropdown from "./ProfileDropdown";
import "./WelcomePage.css";
import "./AIAnalysis.css";

const API = "http://localhost:3001";

const INDICATORS = [
  { key: "heartRate", name: "Heart Rate", unit: " bpm" },
  { key: "sleepHours", name: "Sleep", unit: " hrs" },
  { key: "oxygenLevel", name: "Oxygen", unit: "%" },
  { key: "stressLevel", name: "Stress", unit: "/10" },
];

function validNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatNumber(value) {
  return Number(value.toFixed(1)).toString();
}

function toDate(value) {
  if (!value) return null;

  const date = new Date(
    value.includes("T")
      ? value
      : value.replace(" ", "T") + "Z"
  );

  return Number.isNaN(date.getTime()) ? null : date;
}

function calculateIndicators(records) {
  return INDICATORS.map((indicator) => {
    const readings = records
      .map((record) => ({
        value: validNumber(record[indicator.key]),
        date: toDate(record.recordedAt),
      }))
      .filter((reading) => reading.value !== null);

    if (!readings.length) {
      return {
        ...indicator,
        value: "No data",
        status: "Not recorded",
        baseline: "Not available",
        change: null,
      };
    }

    const current = readings.at(-1).value;
    const previous = readings.slice(0, -1);

    if (!previous.length) {
      return {
        ...indicator,
        value: `${formatNumber(current)}${indicator.unit}`,
        status: "Latest reading",
        baseline: "Not enough history",
        change: null,
      };
    }

    const baseline =
      previous.reduce((sum, item) => sum + item.value, 0) /
      previous.length;

    const difference = current - baseline;

    const status =
      Math.abs(difference) < 0.05
        ? "Similar to previous readings"
        : difference > 0
          ? "Above previous average"
          : "Below previous average";

    return {
      ...indicator,
      value: `${formatNumber(current)}${indicator.unit}`,
      status,
      baseline: `${formatNumber(baseline)}${indicator.unit}`,
      change: difference,
    };
  });
}

export default function AIAnalysis() {
  const [question, setQuestion] = useState("");
  const [selectedDays, setSelectedDays] = useState("7");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your AstroHealth AI Assistant. I can help explain your saved health measurements and trends. What would you like to know?",
    },
  ]);

  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [doctorMessage, setDoctorMessage] = useState("");
  const sendingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecords() {
      setLoading(true);
      setDataError("");

      try {
        const response = await fetch(
          `${API}/api/dashboard/history`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load Dashboard history.");
        }

        const result = await response.json();

        if (!Array.isArray(result)) {
          throw new Error("Invalid Dashboard history response.");
        }

        setRecords(result);
      } catch (error) {
        if (error.name !== "AbortError") {
          setDataError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRecords();

    return () => controller.abort();
  }, []);

  const filteredRecords = useMemo(() => {
    const cutoff =
      Date.now() - Number(selectedDays) * 86400000;

    return records.filter((record) => {
      const date = toDate(record.recordedAt);
      return date && date.getTime() >= cutoff;
    });
  }, [records, selectedDays]);

  const indicators = useMemo(
    () => calculateIndicators(filteredRecords),
    [filteredRecords]
  );

  const observations = useMemo(() => {
    return indicators
      .filter((item) => item.change !== null)
      .filter((item) => Math.abs(item.change) >= 0.05)
      .map((item) => `${item.name} is ${item.status.toLowerCase()}`);
  }, [indicators]);

  const overallStatus = loading
    ? "Loading Health Data"
    : dataError
      ? "Data Unavailable"
      : filteredRecords.length === 0
        ? "No Recent Records"
        : "Health Data Recorded";

  async function sendMessage(event) {
    event.preventDefault();

    const text = question.trim();

    if (!text || sendingRef.current) return;

    sendingRef.current = true;
    setIsSending(true);
    setChatError("");

    const history = messages
      .slice(1)
      .slice(-6)
      .map((message) => ({
        role: message.sender === "user" ? "user" : "assistant",
        text: message.text.slice(0, 1000),
      }));

    try {
      const response = await fetch(
        `${API}/api/analysis/chat/1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: text,
            history,
          }),
          signal: AbortSignal.timeout(65000),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to get an answer."
        );
      }

      if (!result.answer?.trim()) {
        throw new Error("The AI returned an empty answer.");
      }

      setMessages((previous) => [
        ...previous,
        { sender: "user", text },
        { sender: "ai", text: result.answer },
      ]);

      setQuestion("");
    } catch (error) {
      setChatError(
        error.name === "TimeoutError"
          ? "The assistant took too long. Please try again."
          : error.message
      );
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }

  function shareHealthData() {
    setShareMessage(
      "Demo only: Health data sharing is not yet connected to a medical officer."
    );
  }

  function contactDoctor() {
    setDoctorMessage(
      "Demo only: Medical consultation requests are not yet connected."
    );
  }

  return (
    <div className="ai-page">
      <header className="main-header">
        <ProfileDropdown />

        <h1>
          <span>Astro</span>
          <span className="brand-blue">Health</span>
        </h1>

        <div className="ai-header-spacer" />
      </header>

      <main className="ai-container">
        <section className="page-heading">
          <h2>AI Health Insights</h2>
          <p>USER-ENTERED DASHBOARD DATA</p>
        </section>

        <section className="overall-status">
          <div>
            <p className="status-label">
              HEALTH DATA OVERVIEW
            </p>

            <h2>{overallStatus}</h2>

            <p>
              {dataError
                ? dataError
                : `${filteredRecords.length} saved record(s) in the selected period. This is a data summary, not a medical assessment.`}
            </p>
          </div>

          <div className="heart-icon" aria-label="Heart icon">
            ♥
          </div>
        </section>

        <div className="main-content">
          <section className="astronaut-health">
            <div className="health-header">
              <div>
                <h2>Astronaut Health</h2>
                <p className="section-description">
                  Your saved Dashboard measurements
                </p>
              </div>

              <div className="days-selector">
                <label htmlFor="past-days">
                  Past Days
                </label>

                <select
                  id="past-days"
                  value={selectedDays}
                  onChange={(event) =>
                    setSelectedDays(event.target.value)
                  }
                >
                  <option value="1">Last 24 Hours</option>
                  <option value="7">Last 7 Days</option>
                  <option value="14">Last 14 Days</option>
                  <option value="30">Last 30 Days</option>
                </select>
              </div>
            </div>

            <div className="indicator-grid">
              {indicators.map((item) => (
                <div
                  className="indicator-card"
                  key={item.key}
                >
                  <p>{item.name}</p>
                  <h3>{item.value}</h3>
                  <span>{item.status}</span>
                  <small>
                    Previous average: {item.baseline}
                  </small>
                </div>
              ))}
            </div>

            <p className="period-note">
              Showing actual Dashboard records from the
              last {selectedDays} day(s).
              A previous average is calculated only when
              earlier measurements are available.
            </p>
          </section>

          <section className="assistant-section">
            <div className="assistant-heading">
              <div>
                <h2>AI Medical Assistant</h2>
                <p>
                  Ask questions about your saved health
                  measurements and symptoms.
                </p>
              </div>

              <span className="assistant-status">
                GEMINI · DASHBOARD DATA
              </span>
            </div>

            <div
              className="chat-window"
              role="log"
              aria-live="polite"
              aria-label="Assistant conversation"
              aria-busy={isSending}
            >
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${message.sender}`}
                >
                  <strong>
                    {message.sender === "ai"
                      ? "ASTROHEALTH AI"
                      : "YOU"}
                  </strong>
                  <p>{message.text}</p>
                </div>
              ))}
            </div>

            {isSending && (
              <p role="status">
                Reviewing saved health data...
              </p>
            )}

            {chatError && (
              <p role="alert">{chatError}</p>
            )}

            <form
              className="chat-input"
              onSubmit={sendMessage}
            >
              <input
                type="text"
                placeholder="Ask about your health..."
                aria-label="Question for the health assistant"
                maxLength={1000}
                disabled={isSending}
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
              />

              <button
                type="submit"
                disabled={isSending || !question.trim()}
              >
                {isSending ? "Thinking..." : "Send"}
              </button>
            </form>

            <p className="disclaimer">
              AI responses are informational, not medical
              diagnoses. Consult qualified medical personnel
              for medical decisions.
            </p>
          </section>

          <section className="analysis-card">
            <h2>Health Pattern Detection</h2>

            <div className="pattern-alert">
              <strong>
                {observations.length
                  ? "Changes in recorded measurements"
                  : "Measurement overview"}
              </strong>

              <p>
                {loading
                  ? "Loading measurements..."
                  : dataError
                    ? "Could not analyze saved records."
                    : observations.length
                      ? observations.join(". ") + "."
                      : "Not enough previous measurements to identify changes."}
              </p>
            </div>

            <h3>Health Summary</h3>
            <p>
              {filteredRecords.length
                ? `Based on ${filteredRecords.length} saved Dashboard record(s), the measurements above show the latest available values and comparisons with earlier readings in this period.`
                : "Save health measurements in the Dashboard to begin reviewing trends."}
            </p>
          </section>

          <section className="share-section">
            <h2>Health Report</h2>

            <p>
              Share your recent health measurements and
              analysis with your medical officer.
            </p>

            <button
              type="button"
              className="share-button"
              onClick={shareHealthData}
            >
              Share Health Data
            </button>

            {shareMessage && (
              <p className="action-message" role="status">
                {shareMessage}
              </p>
            )}
          </section>
        </div>

        <section className="doctor-section">
          <div>
            <h2>Need Medical Assistance?</h2>
            <p>
              Request a consultation with the Earth
              Medical Officer.
            </p>
          </div>

          <button
            type="button"
            className="doctor-button"
            onClick={contactDoctor}
          >
            Contact Medical Officer
          </button>

          {doctorMessage && (
            <p className="action-message" role="status">
              {doctorMessage}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
