import ProfileDropdown from './ProfileDropdown'
import './Healthscreens.css'

export default function HealthHeader({ title }) {
  return (
    <header className="hs-topbar">
      <div>
        <ProfileDropdown />
      </div>
      <h1 className="hs-title">{title}</h1>
      <div />
    </header>
  )
}