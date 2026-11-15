import { useEffect, useState } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import "./WelcomePage.css";
import "./Settings.css";

const API = "http://localhost:3001";
const STORAGE_KEY = "healthMonitoring.user";

const DEFAULT_USER = {
  firstName: "",
  lastName: "",
  dobMonth: 4,
  dobDay: 12,
  dobYear: 1985,
};

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const THIS_YEAR = new Date().getFullYear();

const YEARS = Array.from(
  { length: 73 },
  (_, i) => THIS_YEAR - 18 - i
);

function loadLocalUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      return {
        ...DEFAULT_USER,
        ...JSON.parse(raw),
      };
    }
  } catch {
    // Use default values.
  }

  return { ...DEFAULT_USER };
}

export default function Settings() {
  const [savedUser, setSavedUser] = useState(loadLocalUser);
  const [user, setUser] = useState(loadLocalUser);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load the current Dashboard name from SQLite.
  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboardName() {
      try {
        const response = await fetch(
          `${API}/api/dashboard`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Could not load Dashboard name.");
        }

        const dashboard = await response.json();

        if (dashboard?.name) {
          const parts = dashboard.name.trim().split(/\s+/);

          const firstName = parts.shift() || "";
          const lastName = parts.join(" ");

          const updated = {
            ...loadLocalUser(),
            firstName,
            lastName,
          };

          setUser(updated);
          setSavedUser(updated);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setStatus(
            "Could not connect to Dashboard. Check that the backend is running."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadDashboardName();

    return () => controller.abort();
  }, []);

  const daysInMonth = new Date(
    user.dobYear,
    user.dobMonth,
    0
  ).getDate();

  const isDirty =
    JSON.stringify(user) !== JSON.stringify(savedUser);

  function update(changes) {
    const next = { ...user, ...changes };

    const max = new Date(
      next.dobYear,
      next.dobMonth,
      0
    ).getDate();

    if (next.dobDay > max) {
      next.dobDay = max;
    }

    setUser(next);
    setStatus("");
  }

  async function handleSave(event) {
    event.preventDefault();

    const cleaned = {
      ...user,
      firstName: user.firstName.trim(),
      lastName: user.lastName.trim(),
    };

    const fullName = [
      cleaned.firstName,
      cleaned.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    if (!fullName) {
      setStatus("Please enter your name.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const response = await fetch(
        `${API}/api/dashboard/name`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: fullName,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not update name."
        );
      }

      // Keep birth date and name in local storage.
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cleaned)
      );

      setSavedUser(cleaned);
      setUser(cleaned);
      setStatus("Changes saved successfully!");
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="settings-profile">
          <ProfileDropdown />
        </div>

        <div className="settings-header-title">
          <div className="settings-icon-box">
            <SettingsIcon size={36} strokeWidth={2} />
          </div>

          <h1>Settings</h1>
        </div>
      </header>

      <main className="settings-main">
        <section
          className="settings-card"
          aria-labelledby="user-info-title"
        >
          <div className="settings-card-header">
            <h2 id="user-info-title">
              Edit User Information
            </h2>
          </div>

          <form
            className="settings-form"
            autoComplete="off"
            onSubmit={handleSave}
          >
            <div className="settings-field">
              <label htmlFor="first-name">
                First Name
              </label>

              <input
                id="first-name"
                type="text"
                maxLength={50}
                value={user.firstName}
                disabled={loading || saving}
                onChange={(e) =>
                  update({
                    firstName: e.target.value,
                  })
                }
              />
            </div>

            <div className="settings-field">
              <label htmlFor="last-name">
                Last Name
              </label>

              <input
                id="last-name"
                type="text"
                maxLength={50}
                value={user.lastName}
                disabled={loading || saving}
                onChange={(e) =>
                  update({
                    lastName: e.target.value,
                  })
                }
              />
            </div>

            <div className="settings-field">
              <span
                className="settings-label"
                id="dob-label"
              >
                Birth Date
              </span>

              <div
                className="settings-dob"
                role="group"
                aria-labelledby="dob-label"
              >
                <select
                  aria-label="Birth month"
                  value={user.dobMonth}
                  disabled={loading || saving}
                  onChange={(e) =>
                    update({
                      dobMonth: Number(e.target.value),
                    })
                  }
                >
                  {MONTHS.map((month, i) => (
                    <option
                      key={month}
                      value={i + 1}
                    >
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Birth day"
                  value={user.dobDay}
                  disabled={loading || saving}
                  onChange={(e) =>
                    update({
                      dobDay: Number(e.target.value),
                    })
                  }
                >
                  {Array.from(
                    { length: daysInMonth },
                    (_, i) => i + 1
                  ).map((day) => (
                    <option
                      key={day}
                      value={day}
                    >
                      {day}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Birth year"
                  value={user.dobYear}
                  disabled={loading || saving}
                  onChange={(e) =>
                    update({
                      dobYear: Number(e.target.value),
                    })
                  }
                >
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="settings-save"
              disabled={!isDirty || loading || saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <p
              className={`settings-status${
                status &&
                status !== "Changes saved successfully!"
                  ? " is-error"
                  : ""
              }`}
              role="status"
              aria-live="polite"
            >
              {status}
            </p>
          </form>
        </section>

        <p className="settings-note">
          Your name is connected to your Dashboard.
          Birth date is currently stored on this device.
        </p>
      </main>
    </div>
  );
}
