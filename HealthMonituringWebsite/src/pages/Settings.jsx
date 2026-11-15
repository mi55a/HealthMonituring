import { useEffect, useRef, useState } from 'react'
import './Settings.css'

const STORAGE_KEY = 'healthMonitoring.user'

// Placeholder user until authentication is added.
const DUMMY_USER = {
  firstName: 'Alex',
  lastName: 'Rivera',
  dobMonth: 4,
  dobDay: 12,
  dobYear: 1985,
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const THIS_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 73 }, (_, i) => THIS_YEAR - 18 - i)

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DUMMY_USER, ...JSON.parse(raw) }
  } catch {
    // Storage unavailable or corrupted: fall back to the placeholder user.
  }
  return DUMMY_USER
}

function GearIcon() {
  return (
    <svg className="settings-gear" viewBox="0 0 48 48" aria-hidden="true">
      <g fill="currentColor">
        <circle cx="24" cy="24" r="14" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <rect
            key={deg}
            x="20"
            y="2"
            width="8"
            height="10"
            rx="2"
            transform={`rotate(${deg} 24 24)`}
          />
        ))}
      </g>
      <circle cx="24" cy="24" r="6" fill="var(--settings-blue)" />
    </svg>
  )
}

export default function Settings() {
  const [savedUser, setSavedUser] = useState(loadUser)
  const [user, setUser] = useState(savedUser)
  const [status, setStatus] = useState('')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const daysInMonth = new Date(user.dobYear, user.dobMonth, 0).getDate()
  const isDirty = JSON.stringify(user) !== JSON.stringify(savedUser)

  // Edits stay in a draft until the Save button is pressed.
  function update(changes) {
    const next = { ...user, ...changes }
    const max = new Date(next.dobYear, next.dobMonth, 0).getDate()
    if (next.dobDay > max) next.dobDay = max
    setUser(next)
    setStatus('')
  }

  function handleSave(e) {
    e.preventDefault()
    const cleaned = {
      ...user,
      firstName: user.firstName.trim(),
      lastName: user.lastName.trim(),
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
      setSavedUser(cleaned)
      setUser(cleaned)
      setStatus('Saved')
    } catch {
      setStatus('Could not save on this device')
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus(''), 2500)
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <GearIcon />
        <h1>Settings</h1>
      </header>

      <main className="settings-main">
        <section className="settings-card" aria-labelledby="user-info-title">
          <h2 id="user-info-title">User Information</h2>

          <form
            className="settings-form"
            autoComplete="off"
            onSubmit={handleSave}
          >
            <div className="settings-field">
              <label htmlFor="first-name">First Name:</label>
              <input
                id="first-name"
                type="text"
                maxLength={50}
                value={user.firstName}
                onChange={(e) => update({ firstName: e.target.value })}
              />
            </div>

            <div className="settings-field">
              <label htmlFor="last-name">Last Name:</label>
              <input
                id="last-name"
                type="text"
                maxLength={50}
                value={user.lastName}
                onChange={(e) => update({ lastName: e.target.value })}
              />
            </div>

            <div className="settings-field">
              <span className="settings-label" id="dob-label">Birth Date:</span>
              <div className="settings-dob" role="group" aria-labelledby="dob-label">
                <select
                  aria-label="Birth month"
                  value={user.dobMonth}
                  onChange={(e) => update({ dobMonth: Number(e.target.value) })}
                >
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
                <select
                  aria-label="Birth day"
                  value={user.dobDay}
                  onChange={(e) => update({ dobDay: Number(e.target.value) })}
                >
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  aria-label="Birth year"
                  value={user.dobYear}
                  onChange={(e) => update({ dobYear: Number(e.target.value) })}
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="settings-save" disabled={!isDirty}>
              Save
            </button>

            <p
              className={`settings-status${status && status !== 'Saved' ? ' is-error' : ''}`}
              role="status"
              aria-live="polite"
            >
              {status}
            </p>
          </form>
        </section>

        <p className="settings-note">
          Signed in as a placeholder user until authentication is added.
          Press Save to keep your changes. They are stored on this device only.
        </p>
      </main>
    </div>
  )
}
