import HealthHeader from './Healthheader'
import TrendChart from './Trendchart'

export default function TrendScreen({ title, metric, onBack }) {
  return (
    <div className="hs-page">
      <HealthHeader title={title} />
      <main className="hs-card">
        {metric ? (
          <>
            <TrendChart points={metric.history} low={metric.low} high={metric.high} />
            <p className="hs-legend">
              Shaded area = normal range. Green dot = normal. Yellow dot = outside the range.
            </p>
          </>
        ) : (
          <p className="hs-legend">No data found for this metric.</p>
        )}
        <div className="hs-footer">
          <button className="hs-button" onClick={onBack}>
            Back
          </button>
        </div>
      </main>
    </div>
  )
}