
import { useRef, useState } from "react";
import ProfileDropdown from "./ProfileDropdown";
import "./WelcomePage.css";
import "./AIAnalysis.css";

const healthData = [
  {
    name: "Heart Rate",
    value: "82 bpm",
    status: "Above baseline",
    baseline: "72 bpm",
  },
  {
    name: "Sleep",
    value: "5.2 hrs",
    status: "Below baseline",
    baseline: "7.5 hrs",
  },
  {
    name: "Oxygen",
    value: "98%",
    status: "Normal",
    baseline: "97–99%",
  },
  {
    name: "Stress",
    value: "72/100",
    status: "Elevated",
    baseline: "40/100",
  },
];

export default function AIAnalysis() {
  const [question, setQuestion] = useState("");
  const [selectedDays, setSelectedDays] = useState("7");

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your AI Medical Assistant. I can review your previous health records and help explain unusual changes. What would you like to know?",
    },
  ]);

  const [shareMessage, setShareMessage] = useState("");
  const [doctorMessage, setDoctorMessage] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const sendingRef = useRef(false);

  async function sendMessage(e) {
    e.preventDefault();
    const text = question.trim();
    if (!text || sendingRef.current) return;

    sendingRef.current = true;
    setIsSending(true);
    setChatError("");
    const history = messages.slice(1).slice(-6).map((message) => ({
      role: message.sender === "user" ? "user" : "assistant",
      text: message.text.slice(0, 1000),
    }));
    // Commit the new conversation only when the server returns an answer.
    // On failure the input and earlier conversation remain ready for retry.
    try {
      const response = await fetch("http://localhost:3001/api/analysis/chat/1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history }),
        signal: AbortSignal.timeout(65000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to get an answer.");
      if (typeof result.answer !== "string" || !result.answer.trim()) {
        throw new Error("The assistant returned an empty answer. Please try again.");
      }
      setMessages((previous) => [
        ...previous,
        { sender: "user", text },
        { sender: "ai", text: result.answer },
      ]);
      setQuestion("");
    } catch (error) {
      setChatError(error.name === "TimeoutError"
        ? "The assistant took too long. Please try again."
        : error instanceof TypeError
          ? "Could not connect to the backend. Check that the outer server is running on port 3001."
          : error.message);
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }

  function shareHealthData() {
    setShareMessage(
      "Demo: Your health report is ready to be shared with the medical officer. Actual sharing requires backend integration."
    );
  }

  function contactDoctor() {
    setDoctorMessage(
      "Demo: Your consultation request has been prepared for the Earth Medical Officer. A real connection requires backend integration."
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
          <p>MISSION DAY 127 · DEMO DATA</p>
        </section>

        <section className="overall-status">
          <div>
            <p className="status-label">OVERALL HEALTH STATUS</p>
            <h2>Needs Attention</h2>
            <p>
              Some health measurements have changed from your
              personal baseline.
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
                  Review your latest recorded health measurements
                </p>
              </div>

              <div className="days-selector">
                <label htmlFor="past-days">Past Days</label>
                <select
                  id="past-days"
                  value={selectedDays}
                  onChange={(e) => setSelectedDays(e.target.value)}
                >
                  <option value="1">Last 24 Hours</option>
                  <option value="7">Last 7 Days</option>
                  <option value="14">Last 14 Days</option>
                  <option value="30">Last 30 Days</option>
                </select>
              </div>
            </div>

            <div className="indicator-grid">
              {healthData.map((item) => (
                <div className="indicator-card" key={item.name}>
                  <p>{item.name}</p>
                  <h3>{item.value}</h3>
                  <span>{item.status}</span>
                  <small>Baseline: {item.baseline}</small>
                </div>
              ))}
            </div>

            <p className="period-note">
              Showing the selected period: Last {selectedDays} day(s).
              Historical filtering will be connected to health records.
            </p>
          </section>

          <section className="assistant-section">
            <div className="assistant-heading">
              <div>
                <h2>AI Medical Assistant</h2>
                <p>Ask questions about your health and symptoms.</p>
              </div>
              <span className="assistant-status">GEMINI · SAVED DASHBOARD DATA</span>
            </div>

            <div className="chat-window" role="log" aria-live="polite" aria-label="Assistant conversation" aria-busy={isSending}>
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

            {isSending && <p role="status">Thinking… Reviewing saved dashboard data.</p>}
            {chatError && <p role="alert">{chatError}</p>}
            <form className="chat-input" onSubmit={sendMessage}>
              <input
                type="text"
                placeholder="Ask about your health..."
                aria-label="Question for the health assistant"
                maxLength={1000}
                disabled={isSending}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button type="submit" disabled={isSending || !question.trim()}>{isSending ? "Thinking…" : "Send"}</button>
            </form>

            <p className="disclaimer">
              AI suggestions are not medical diagnoses.
              Contact a medical professional for medical decisions.
            </p>
          </section>

          <section className="analysis-card">
            <h2>AI Pattern Detection</h2>

            <div className="pattern-alert">
              <strong>Changes detected</strong>
              <p>
                Your heart rate is above baseline, while your sleep
                is below baseline and stress is elevated.
              </p>
            </div>

            <h3>AI Health Summary</h3>
            <p>
              Your recent demo records show reduced sleep, increased
              stress, and a higher-than-usual heart rate. These
              changes may be related, but more information is
              needed to understand the cause.
            </p>
          </section>

          <section className="share-section">
            <h2>Health Report</h2>
            <p>
              Share your recent health measurements and AI analysis
              with your medical officer.
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
              Request a consultation with the Earth Medical Officer.
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