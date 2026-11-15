import HealthHeader from './Healthheader'

const STATS = [
  { name: 'Blood sugar', value: '90mg/dL', status: 'Normal' },
  { name: 'Oxygen level', value: '95%', status: 'Normal' },
]

export default function PhysicalStats({ onSeeTrends, onBack }) {
  return (
    <div>
      <HealthHeader title="Physical Health Stats (Today)" />
      <div className="hs-panel">
        {STATS.map((stat) => (
          <div className="hs-stat-row" key={stat.name}>
            <span className="hs-stat-text">
              {stat.name}: {stat.value}
            </span>
            <span className={'hs-status ' + stat.status.toLowerCase()}>
              {stat.status}
            </span>
            <button className="hs-button" onClick={() => onSeeTrends(stat.name)}>
              See Trends
            </button>
          </div>
        ))}
        <button className="hs-button hs-back-in-panel" onClick={onBack}>
          Back
        </button>
      </div>
      <p className="hs-time">Time collected: 10:00 AM CST</p>
    </div>
  )
}