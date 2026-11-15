import HealthHeader from './Healthheader'
import TrendChart from './Trendchart'
import { Navigate, useNavigate } from 'react-router-dom'

export default function TrendScreen({ title, metric}) {
  const navigate = useNavigate();
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
          <button className="hs-button" onClick={() => navigate("/dashboard")}>
            Back
          </button>
        </div>
      </main>
    </div>
  )
}