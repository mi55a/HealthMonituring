import HealthHeader from './Healthheader'

export default function MentalTrend({ metric, onBack }) {
  return (
    <div>
      <HealthHeader title={metric + ' (all time):'} />
      <div className="hs-chart-box">Chart goes here</div>
      <button className="hs-button hs-back" onClick={onBack}>
        Back
      </button>
    </div>
  )
}