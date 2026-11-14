
import { useEffect, useRef, useState } from "react";
import { Settings as SettingsIcon, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const STORAGE_KEY = "healthMonitoring.user";

// Placeholder user until authentication is implemented.
const DUMMY_USER = {
  firstName: "Alex",
  lastName: "Rivera",
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

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (raw) {
      return {
        ...DUMMY_USER,
        ...JSON.parse(raw),
      };
    }
  } catch {
    // Fall back to placeholder user.
  }

  return DUMMY_USER;
}

export default function Settings() {
  const navigate = useNavigate();

  const [savedUser, setSavedUser] = useState(loadUser);
  const [user, setUser] = useState(savedUser);
  const [status, setStatus] = useState("");

  const timer = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const daysInMonth = new Date(
    user.dobYear,
    user.dobMonth,
    0
  ).getDate();

  const isDirty =
    JSON.stringify(user) !== JSON.stringify(savedUser);

  // Update the form without saving immediately.
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

  // Save changes to local storage.
  function handleSave(e) {
    e.preventDefault();

    const cleaned = {
      ...user,
      firstName: user.firstName.trim(),
      lastName: user.lastName.trim(),
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cleaned)
      );

      setSavedUser(cleaned);
      setUser(cleaned);
      setStatus("Changes saved successfully!");
    } catch {
      setStatus("Could not save on this device");
    }

    clearTimeout(timer.current);

    timer.current = setTimeout(() => {
      setStatus("");
    }, 2500);
  }

  return (
    <div className="settings-page">

      {/* Header */}
      <header className="settings-header">

        {/* Home Button */}
        <button
          type="button"
          className="settings-home"
          onClick={() => navigate("/")}
        >
          <Home size={18} />
          <span>Home</span>
        </button>

        {/* Centered Settings Title */}
        <div className="settings-header-title">
          <div className="settings-icon-box">
            <SettingsIcon size={36} strokeWidth={2} />
          </div>

          <h1>Settings</h1>
        </div>

      </header>

      {/* Main Content */}
      <main className="settings-main">

        {/* Centered User Information Card */}
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

            {/* First Name */}
            <div className="settings-field">
              <label htmlFor="first-name">
                First Name
              </label>

              <input
                id="first-name"
                type="text"
                maxLength={50}
                value={user.firstName}
                onChange={(e) =>
                  update({
                    firstName: e.target.value,
                  })
                }
              />
            </div>

            {/* Last Name */}
            <div className="settings-field">
              <label htmlFor="last-name">
                Last Name
              </label>

              <input
                id="last-name"
                type="text"
                maxLength={50}
                value={user.lastName}
                onChange={(e) =>
                  update({
                    lastName: e.target.value,
                  })
                }
              />
            </div>

            {/* Birth Date */}
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

                {/* Month */}
                <select
                  aria-label="Birth month"
                  value={user.dobMonth}
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

                {/* Day */}
                <select
                  aria-label="Birth day"
                  value={user.dobDay}
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
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>

                {/* Year */}
                <select
                  aria-label="Birth year"
                  value={user.dobYear}
                  onChange={(e) =>
                    update({
                      dobYear: Number(e.target.value),
                    })
                  }
                >
                  {YEARS.map((year) => (
                    <option
                      key={year}
                      value={year}
                    >
                      {year}
                    </option>
                  ))}
                </select>

              </div>
            </div>

            {/* Save Changes */}
            <button
              type="submit"
              className="settings-save"
              disabled={!isDirty}
            >
              Save Changes
            </button>

            {/* Save Confirmation */}
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

        {/* Footer Note */}
        <p className="settings-note">
          Signed in as a placeholder user until authentication
          is added. Press Save to keep your changes.
          They are stored on this device only.
        </p>

      </main>
    </div>
  );
}
