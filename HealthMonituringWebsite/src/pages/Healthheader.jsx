import './healthScreens.css'

export default function HealthHeader({ title }) {
  return (
    <header className="hs-header">
      <span className="hs-gear" aria-hidden="true">⚙</span>
      <select className="hs-profile" aria-label="Profile menu">
        <option>MY PROFILE</option>
      </select>
      <h1>{title}</h1>
    </header>
  )
}