
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";




import "./WelcomePage.css";
import "./Dashboard.css";

const API = "http://localhost:3001";

const initialData = {
  name: "",
  heartRate: "",
  bloodPressure: "",
  diastolic: "",
  sleepHours: "",
  stressLevel: "",
  mood: "",
  oxygenLevel: "",
  temperature: "",
  bloodSugar: "",
  waterIntake: "",
  exercise: "",
  visionCheck: "",
  nausea: "",
  dizziness: "",
  radiationDose: "",
};

const sections = [
  {
    title: "Heart & Circulation",
    fields: [
      {
        key: "heartRate",
        label: "Heart Rate (bpm)",
        min: 1,
        max: 300,
        required: true,
      },
      {
        key: "bloodPressure",
        label: "Systolic Blood Pressure (mmHg)",
        min: 1,
        max: 300,
        required: true,
      },
      {
        key: "diastolic",
        label: "Diastolic Blood Pressure (mmHg)",
        min: 1,
        max: 300,
      },
    ],
  },
  {
    title: "Brain & Mind",
    fields: [
      {
        key: "sleepHours",
        label: "Sleep (hours)",
        min: 0,
        max: 24,
        required: true,
      },
      {
        key: "stressLevel",
        label: "Stress Level (0–10)",
        min: 0,
        max: 10,
        required: true,
      },
      {
        key: "mood",
        label: "Mood (1–5)",
        min: 1,
        max: 5,
      },
    ],
  },
  {
    title: "Lungs & Respiratory",
    fields: [
      {
        key: "oxygenLevel",
        label: "Blood Oxygen SpO₂ (%)",
        min: 0,
        max: 100,
      },
    ],
  },
  {
    title: "Immune & Metabolism",
    fields: [
      {
        key: "temperature",
        label: "Body Temperature (°C)",
        min: 20,
        max: 45,
      },
      {
        key: "bloodSugar",
        label: "Blood Glucose (mg/dL)",
        min: 1,
        max: 1000,
      },
    ],
  },
  {
    title: "Kidneys & Hydration",
    fields: [
      {
        key: "waterIntake",
        label: "Water Intake (liters)",
        min: 0,
        max: 30,
      },
    ],
  },
  {
    title: "Bones & Muscles",
    fields: [
      {
        key: "exercise",
        label: "Exercise Duration (minutes)",
        min: 0,
        max: 1440,
      },
    ],
  },
  {
    title: "Eyes & Balance",
    fields: [
      {
        key: "visionCheck",
        label: "Vision Check (notes)",
        text: true,
      },
      {
        key: "nausea",
        label: "Nausea (0–10)",
        min: 0,
        max: 10,
      },
      {
        key: "dizziness",
        label: "Dizziness (0–10)",
        min: 0,
        max: 10,
      },
    ],
  },
  {
    title: "Radiation Exposure",
    fields: [
      {
        key: "radiationDose",
        label: "Radiation Dose (mSv)",
        min: 0,
        max: 100000,
      },
    ],
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [draft, setDraft] = useState({ ...initialData });
  const [isEditing, setIsEditing] = useState(false);

  const dialogRef = useRef(null);

  const needsSetup = !loading && (!data || isEditing);

  // Load saved dashboard information
  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        const response = await fetch(
          `${API}/api/dashboard`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load dashboard data."
          );
        }

        const saved = await response.json();

        setData(saved);
        setDraft({
          ...initialData,
          ...(saved ?? {}),
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "Cannot connect to the backend on port 3001. Start the server and refresh."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => controller.abort();
  }, []);

  // Open or close modal
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (needsSetup && !dialog.open) {
      dialog.showModal();
    }

    if (!needsSetup && dialog.open) {
      dialog.close();
    }
  }, [needsSetup]);

  // Save health data
  async function saveData(event) {
    event.preventDefault();

    const nextData = {
      ...draft,
      name: draft.name.trim(),
    };

    if (!nextData.name) {
      const nameInput =
        event.currentTarget.elements.name;

      nameInput.setCustomValidity(
        "Please enter your display name."
      );

      event.currentTarget.reportValidity();
      return;
    }

    const numericFields = [
      "heartRate",
      "bloodPressure",
      "sleepHours",
      "stressLevel",
    ];

    const hasInvalidNumber = numericFields.some(
      (key) =>
        nextData[key] === "" ||
        !Number.isFinite(Number(nextData[key]))
    );

    if (hasInvalidNumber) {
      event.currentTarget.reportValidity();
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/api/dashboard`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nextData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          "Unable to save health data."
        );
      }

      setData(result);
      setDraft({
        ...initialData,
        ...result,
      });

      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit() {
    setError("");

    setDraft({
      ...initialData,
      ...(data ?? {}),
    });

    setIsEditing(true);
  }

  function handleCancel() {
    setError("");

    setDraft({
      ...initialData,
      ...(data ?? {}),
    });

    setIsEditing(false);
  }

  return (
    <div className="dashboard-page">
      <nav
        className="dashboard-nav"
        aria-label="Main navigation"
      >
        <ProfileDropdown />

        <div className="title-dashboard">
          <span>Astro</span>
          <span className="dashboard-brand-blue">
            Health
          </span>
        </div>

        <div className="dashboard-nav-spacer" />
      </nav>

      {error && !needsSetup && (
        <p
          role="alert"
          style={{
            color: "#b42318",
            textAlign: "center",
            padding: "12px",
          }}
        >
          {error}
        </p>
      )}

      {loading && (
        <p style={{ textAlign: "center" }}>
          Loading health data...
        </p>
      )}

      <main
        className="dashboard-main"
        hidden={!data}
      >
        <header className="dashboard-heading">
          <h1>
            {data
              ? `Welcome, ${data.name}`
              : "Welcome to your dashboard"}
          </h1>

          <p>Your daily health overview</p>
        </header>

        <section aria-labelledby="quick-actions-title">
          <h2
            id="quick-actions-title"
            className="dashboard-section-title"
          >
            Quick Actions
          </h2>

          <div className="actions">
              <button 
                type="button" onClick={() => navigate("/physical-stats")}>
                Physical Health Stats
              </button>

              <button 
                type="button" onClick={() => navigate("/mental-stats")}>
                Mental Health Stats
              </button>

            <button
              type="button"
              onClick={() =>
                navigate("/health-stats")
              }
            >
              Body Map
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/ai-analysis")
              }
            >
              AI Assistant
            </button>
          </div>
        </section>

        <section
          aria-label="Health metrics"
          className="metrics"
        >
          <article className="dashboard-summary-card">
            <div className="dashboard-card-heading">
              <h2>Summary for Today</h2>

              <button
                type="button"
                className="dashboard-edit"
                onClick={handleEdit}
              >
                Edit Data
              </button>
            </div>

            <div className="summary-grid">
              {[
                [
                  "Heart Rate",
                  data?.heartRate,
                  "bpm",
                ],
                [
                  "Blood Pressure",
                  data?.diastolic != null
                    ? `${data.bloodPressure}/${data.diastolic}`
                    : data?.bloodPressure,
                  "mm Hg",
                ],
                [
                  "Sleep",
                  data?.sleepHours,
                  "hours",
                ],
                [
                  "Stress Level",
                  data?.stressLevel,
                  "/10",
                ],
              ].map(([label, value, unit]) => (
                <div
                  className="summary-row"
                  key={label}
                >
                  <span>{label}</span>

                  <strong>
                    {value ?? "—"}{" "}
                    {value != null ? unit : ""}
                  </strong>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>

      {/* Dashboard health form modal */}
      <dialog
        ref={dialogRef}
        className="dashboard-dialog"
        aria-labelledby="setup-title"
        aria-describedby="setup-description"
        onCancel={(event) => {
          if (!data) {
            event.preventDefault();
          } else {
            handleCancel();
          }
        }}
        style={{
          width: "min(520px, calc(100vw - 32px))",
          maxWidth: "520px",
          maxHeight: "min(90dvh, 850px)",
          height: "auto",
          margin: "auto",
          padding: "0",
          overflow: "hidden",
          border: "none",
          borderRadius: "18px",
          boxSizing: "border-box",
          background: "#ffffff",
          boxShadow:
            "0 20px 60px rgba(16, 35, 68, 0.2)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: "min(90dvh, 850px)",
            minHeight: 0,
            width: "100%",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* Fixed modal header */}
          <div
            style={{
              flexShrink: 0,
              padding: "28px 30px 18px",
              background: "#ffffff",
            }}
          >
            <h2
              id="setup-title"
              style={{
                margin: "0 0 8px",
                fontSize: "24px",
                fontWeight: 700,
                color: "#102344",
              }}
            >
              {data
                ? "Edit Your Information"
                : "Set Up Your Dashboard"}
            </h2>

            <p
              id="setup-description"
              className="muted"
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              {data
                ? "Update your health information below."
                : "Complete the required fields to set up your dashboard."}
            </p>
          </div>

          {/* Form fills remaining modal height */}
          <form
            onSubmit={saveData}
            style={{
              display: "flex",
              flexDirection: "column",
              flex: "1 1 auto",
              minHeight: 0,
              margin: 0,
              padding: 0,
              overflow: "hidden",
            }}
          >
            {/* Single scrollable form area */}
            <div
              style={{
                flex: "1 1 auto",
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                padding: "8px 30px 22px",
                scrollbarWidth: "thin",
                scrollbarColor:
                  "#b9a2df transparent",
                boxSizing: "border-box",
              }}
            >
              <label>
                Display Name

                <input
                  name="name"
                  type="text"
                  required
                  autoFocus
                  maxLength={50}
                  placeholder="Enter your name"
                  value={draft.name}
                  onChange={(event) => {
                    event.target.setCustomValidity("");

                    setDraft({
                      ...draft,
                      name: event.target.value,
                    });
                  }}
                />
              </label>

              <p
                className="muted"
                style={{
                  margin: "18px 0 22px",
                  fontSize: "12px",
                  lineHeight: 1.6,
                }}
              >
                Additional measurements are optional.
                Leave any unknown measurements blank.
              </p>

              {sections.map((section) => (
                <fieldset
                  key={section.title}
                  style={{
                    minWidth: 0,
                    border:
                      "1px solid #e4d9f6",
                    borderRadius: "12px",
                    padding: "16px",
                    margin: "0 0 20px",
                    boxSizing: "border-box",
                  }}
                >
                  <legend
                    style={{
                      color: "#7534d8",
                      fontSize: "15px",
                      fontWeight: 700,
                      padding: "0 8px",
                    }}
                  >
                    {section.title}
                  </legend>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px",
                    }}
                  >
                    {section.fields.map((field) => (
                      <label
                        key={field.key}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "7px",
                          margin: 0,
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#102344",
                        }}
                      >
                        <span>
                          {field.label}
                          {field.required
                            ? " *"
                            : " (optional)"}
                        </span>

                        <input
                          type={
                            field.text
                              ? "text"
                              : "number"
                          }
                          min={field.min}
                          max={field.max}
                          step={
                            field.text
                              ? undefined
                              : "any"
                          }
                          maxLength={
                            field.text
                              ? 300
                              : undefined
                          }
                          required={Boolean(
                            field.required
                          )}
                          value={
                            draft[field.key] ?? ""
                          }
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              [field.key]:
                                event.target.value,
                            }))
                          }
                          style={{
                            display: "block",
                            width: "100%",
                            minWidth: 0,
                            height: "44px",
                            padding: "10px 12px",
                            margin: 0,
                            boxSizing: "border-box",
                            border:
                              "1px solid #b6c8e4",
                            borderRadius: "10px",
                            background: "#ffffff",
                            color: "#102344",
                            fontSize: "14px",
                            outlineOffset: "2px",
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}

              {error && (
                <p
                  role="alert"
                  style={{
                    color: "#b42318",
                    fontSize: "13px",
                    marginTop: "10px",
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Fixed footer - always visible */}
            <div
              className="form-actions"
              style={{
                display: "flex",
                flexShrink: 0,
                justifyContent: "flex-end",
                alignItems: "center",
                gap: "12px",
                padding: "18px 30px",
                margin: 0,
                borderTop:
                  "1px solid #eee8f7",
                background: "#ffffff",
                boxSizing: "border-box",
              }}
            >
              {data && (
                <button
                  type="button"
                  className="dashboard-cancel"
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    margin: 0,
                    minHeight: "42px",
                    padding: "10px 20px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="primary"
                disabled={saving}
                style={{
                  margin: 0,
                  minHeight: "42px",
                  padding: "10px 22px",
                  background: "#7534d8",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  cursor: saving
                    ? "wait"
                    : "pointer",
                }}
              >
                {saving
                  ? "Saving..."
                  : data
                  ? "Save Changes"
                  : "View Dashboard"}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
