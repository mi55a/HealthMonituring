import { useEffect, useRef, useState } from 'react'
import './Dashboard.css'

const storageKey = 'healthmonitoring.dashboard.v1'
const sampleData = { name: 'Astronaut', heartRate: '72', bloodPressure: '6000', sleepHours: '8', stressLevel: '10' }

function readSavedData() {
  try {
    const data = JSON.parse(localStorage.getItem(storageKey))
    if (
      typeof data?.name === 'string' && data.name.trim() &&
      Number.isFinite(Number(data.heartRate)) && Number(data.heartRate) > 0 &&
      data.steps !== '' && Number.isInteger(Number(data.steps)) && Number(data.steps) >= 0 &&
      data.sleep !== '' && data.sleep != null &&
      Number.isFinite(Number(data.sleep)) && Number(data.sleep) >= 0 && Number(data.sleep) <= 24
    ) return data
  } catch {
  }
  return null
}

export default function Dashboard() {
  const [data, setData] = useState(readSavedData)
  const [draft, setDraft] = useState(() => data ?? { ...sampleData })
  const [isEditing, setIsEditing] = useState(false)
  const dialogRef = useRef(null)
  const needsSetup = !data || isEditing

  useEffect(() => {
    const dialog = dialogRef.current
    if (needsSetup && !dialog.open) dialog.showModal()
    if (!needsSetup && dialog.open) dialog.close()
  }, [needsSetup])

  function saveData(event) {
    event.preventDefault()
    const nextData = { ...draft, name: draft.name.trim() }
    if (!nextData.name) {
      event.currentTarget.elements.name.setCustomValidity('Enter a display name.')
      event.currentTarget.reportValidity()
      return
    }
    setData(nextData)
    setIsEditing(false)
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextData))
    } catch {
    }
  }

  function resetDemo() {
    try {
      localStorage.removeItem(storageKey)
    } catch {
    }
    setData(null)
    setDraft({ ...sampleData })
    setIsEditing(false)
  }

  return (
    <div className="dashboard-page">    
      <nav aria-label="Main navigation">
        <div className="title-dashboard">
            <strong>AstroHealth</strong>
        </div>

        <div className="nav-links">
          <button type="button" className="primary" aria-current="page">Log Out</button>
        </div>
      </nav>

      <main>
        <header>
          <div>
            <h1>{data ? `Welcome, ${data.name}` : 'Welcome to your dashboard'}</h1>
          </div>
        </header>

        <section aria-labelledby="quick-actions-title">
          <div className="actions">
            <button type = "button">Physical Health Stats</button>
            <button type = "button">Mental Health Stats</button>
            <button type = "button">Body Map</button>
            <button type = "button">AI Assistant</button>

          </div>
        </section>

        <section aria-label="Health metrics" className="metrics">
          <article>
            <p className="summary">Summary for today</p>

            <div className="summary-grid">
                {[
                ['Heart rate', data?.heartRate, 'bpm'],
                ['Blood Pressure', data ? Number(data.bloodPressure).toLocaleString() : null, 'mm Hg'],
                ['Sleep', data?.sleepHours, 'hours'],
                ['Stress Level', data?.stressLevel, null]
            ].map(([label, value, unit]) => (
            <div className="summary-row" key={label}>
                <span>{label}:</span>
                <strong> {value ?? '—'} {unit}</strong>
                
                </div>
                ))}
            </div>
         </article>
        </section>
        {/* To reset data if needed, will probably be deleted when backend is implemented */}
        {/* <button type="button" onClick={resetDemo}>Reset</button> */}
      </main>

      <dialog ref={dialogRef} aria-labelledby="setup-title" aria-describedby="setup-description"
        onCancel={(event) => {
          if (!data) event.preventDefault()
          else setIsEditing(false)
        }}>
        <h2 id="setup-title">{data ? 'Edit your data' : 'Set up your dashboard'}</h2>
        <p id="setup-description" className="muted">Try the sample values or enter demo values of your own. Saved only in this browser.</p>
        <form onSubmit={saveData}>
          <label>Display name
            <input name="name" required autoFocus value={draft.name} onChange={(event) => {
              event.target.setCustomValidity('')
              setDraft({ ...draft, name: event.target.value })
            }} />
          </label>
          {[
            { key: 'heartRate', label: 'Heart rate (bpm)', min: 1, step: 'any' },
            { key: 'bloodPressure', label: 'Blood Pressure', min: 0, step: 1 },
            { key: 'sleepHours', label: 'Sleep (hours)', min: 0, max: 24, step: 'any' },
            { key: 'stressLevel', label: 'Stress Level ', min: 0, max: 10, step: 'any' }
          ].map(({ key, label, ...constraints }) => (
            <label key={key}>{label}
              <input type="number" required {...constraints} value={draft[key]}
                onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
            </label>
          ))}
          <div className="form-actions">
            {data && <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>}
            <button type="submit" className="primary">{data ? 'Save changes' : 'Done — View dashboard'}</button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
