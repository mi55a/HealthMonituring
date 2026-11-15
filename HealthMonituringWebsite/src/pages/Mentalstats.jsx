import HealthHeader from './Healthheader'

const STATS = [
  { name: 'Anxiety Level', value: '7/10', status: 'Abnormal' },
  { name: 'Fatigue Level', value: '2/10', status: 'Normal' },
]

export default function MentalStats({ onSeeTrends, onBack }) {
  return (
    <div>
      <HealthHeader title="Mental Health Stats (Today)" />
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