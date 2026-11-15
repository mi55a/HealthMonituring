import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import "./WelcomePage.css";
import "./Dashboard.css";

const storageKey = "healthmonitoring.dashboard.v1";

const initialData = {
  name: "",
  heartRate: "",
  bloodPressure: "",
  sleepHours: "",
  stressLevel: "",
};

function readSavedData() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;

    const data = JSON.parse(raw);

    const valid =
      typeof data?.name === "string" &&
      data.name.trim().length > 0 &&
      data.heartRate !== "" &&
      data.heartRate != null &&
      Number.isFinite(Number(data.heartRate)) &&
      Number(data.heartRate) > 0 &&
      data.bloodPressure !== "" &&
      data.bloodPressure != null &&
      Number.isFinite(Number(data.bloodPressure)) &&
      Number(data.bloodPressure) > 0 &&
      data.sleepHours !== "" &&
      data.sleepHours != null &&
      Number.isFinite(Number(data.sleepHours)) &&
      Number(data.sleepHours) >= 0 &&
      Number(data.sleepHours) <= 24 &&
      data.stressLevel !== "" &&
      data.stressLevel != null &&
      Number.isFinite(Number(data.stressLevel)) &&
      Number(data.stressLevel) >= 0 &&
      Number(data.stressLevel) <= 10;

    return valid ? data : null;
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(readSavedData);
  const [draft, setDraft] = useState(
    () => readSavedData() ?? { ...initialData }
  );
  const [isEditing, setIsEditing] = useState(false);
  const dialogRef = useRef(null);

  const needsSetup = !data || isEditing;

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

  function saveData(event) {
    event.preventDefault();

    const nextData = {
      ...draft,
      name: draft.name.trim(),
    };

    if (!nextData.name) {
      const nameInput = event.currentTarget.elements.name;
      nameInput.setCustomValidity("Please enter your display name.");
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

    setData(nextData);
    setIsEditing(false);

    try {
      localStorage.setItem(storageKey, JSON.stringify(nextData));
    } catch {
      // Keep data in memory if local storage is unavailable.
    }
  }

  function handleEdit() {
    setDraft(data ?? { ...initialData });
    setIsEditing(true);
  }

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav" aria-label="Main navigation">
        <ProfileDropdown />

        <div className="title-dashboard">
          <span>Astro</span>
          <span className="dashboard-brand-blue">Health</span>
        </div>

        <div className="dashboard-nav-spacer" />
      </nav>

      <main className="dashboard-main" hidden={!data}>
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
            <button type="button" disabled>
              Physical Health Stats
            </button>

            <button type="button" disabled>
              Mental Health Stats
            </button>

            <button
              type="button"
              onClick={() => navigate("/health-stats")}
            >
              Body Map
            </button>

            <button
              type="button"
              onClick={() => navigate("/ai-analysis")}
            >
              AI Assistant
            </button>
          </div>
        </section>

        <section aria-label="Health metrics" className="metrics">
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
                ["Heart Rate", data?.heartRate, "bpm"],
                ["Blood Pressure", data?.bloodPressure, "mm Hg"],
                ["Sleep", data?.sleepHours, "hours"],
                ["Stress Level", data?.stressLevel, "/10"],
              ].map(([label, value, unit]) => (
                <div className="summary-row" key={label}>
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

      <dialog
        ref={dialogRef}
        className="dashboard-dialog"
        aria-labelledby="setup-title"
        aria-describedby="setup-description"
        onCancel={(event) => {
          if (!data) {
            event.preventDefault();
          } else {
            setDraft(data);
            setIsEditing(false);
          }
        }}
      >
        <h2 id="setup-title">
          {data ? "Edit Your Information" : "Set Up Your Dashboard"}
        </h2>

        <p id="setup-description" className="muted">
          {data
            ? "Update your health information below."
            : "Please complete your health information before accessing your dashboard. All fields are required."}
        </p>

        <form onSubmit={saveData}>
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

          {[
            {
              key: "heartRate",
              label: "Heart Rate (bpm)",
              placeholder: "e.g. 72",
              min: 1,
              step: "any",
            },
            {
              key: "bloodPressure",
              label: "Blood Pressure (mm Hg)",
              placeholder: "e.g. 120",
              min: 1,
              step: "any",
            },
            {
              key: "sleepHours",
              label: "Sleep (hours)",
              placeholder: "e.g. 8",
              min: 0,
              max: 24,
              step: "any",
            },
            {
              key: "stressLevel",
              label: "Stress Level (0–10)",
              placeholder: "e.g. 3",
              min: 0,
              max: 10,
              step: "any",
            },
          ].map(({ key, label, placeholder, ...constraints }) => (
            <label key={key}>
              {label}
              <input
                type="number"
                required
                placeholder={placeholder}
                {...constraints}
                value={draft[key]}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    [key]: event.target.value,
                  })
                }
              />
            </label>
          ))}

          <div className="form-actions">
            {data && (
              <button
                type="button"
                className="dashboard-cancel"
                onClick={() => {
                  setDraft(data);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            )}

            <button type="submit" className="primary">
              {data ? "Save Changes" : "View Dashboard"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}