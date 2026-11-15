import HealthHeader from './Healthheader'

export default function PhysicalTrend({ metric, onBack }) {
  return (
    <div>
      <HealthHeader title={metric + ' (past 3 days):'} />
      <div className="hs-chart-box">Chart goes here</div>
      <button className="hs-button hs-back" onClick={onBack}>
        Back
      </button>
    </div>
  )
}