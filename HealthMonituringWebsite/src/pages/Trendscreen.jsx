import HealthHeader from "./Healthheader";
import TrendChart from "./Trendchart";
import { useNavigate } from "react-router-dom";

export default function TrendScreen({
  title,
  metric,
  loading,
  error,
  backPath,
}) {
  const navigate = useNavigate();

  return (
    <div className="hs-page">
      <HealthHeader title={title} />

      <main className="hs-card">
        {loading ? (
          <p role="status">Loading history...</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : metric?.history?.length ? (
          <>
            <TrendChart
              points={metric.history}
              low={metric.low}
              high={metric.high}
            />

            <p className="hs-legend">
              Shaded area = general reference
              range. Green dots = within range;
              yellow dots = outside range.
              Not a medical diagnosis.
            </p>
          </>
        ) : (
          <p className="hs-legend">
            No saved history for this measurement.
          </p>
        )}

        <div className="hs-footer">
          <button
            className="hs-button"
            onClick={() =>
              navigate(backPath || "/dashboard")
            }
          >
            Back
          </button>
        </div>
      </main>
    </div>
  );
}
