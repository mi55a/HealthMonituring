import HealthHeader from "./Healthheader";
import { getCurrent, isNormal } from "./Healthdata";
import { useNavigate } from "react-router-dom";

export default function StatsScreen({
  title,
  metrics,
  active,
  onSeeTrends,
  loading,
  error,
}) {
  const navigate = useNavigate();

  const latest = metrics
    .flatMap((metric) => metric.history || [])
    .sort((a, b) => b.id - a.id)[0];

  return (
    <div className="hs-page">
      <HealthHeader title={title} />

      <div className="hs-switch">
        <button
          className={
            "hs-switch-button" +
            (active === "physical"
              ? " hs-switch-active"
              : "")
          }
          onClick={() => navigate("/physical-stats")}
        >
          Physical Health
        </button>

        <button
          className={
            "hs-switch-button" +
            (active === "mental"
              ? " hs-switch-active"
              : "")
          }
          onClick={() => navigate("/mental-stats")}
        >
          Mental Health
        </button>
      </div>

      <main className="hs-card">
        {loading && (
          <p role="status">
            Loading saved measurements...
          </p>
        )}

        {error && <p role="alert">{error}</p>}

        {!loading &&
          !error &&
          metrics.map((metric) => {
            const value = getCurrent(metric);
            const available = value !== null;
            const normal = isNormal(metric, value);

            return (
              <div className="hs-row" key={metric.key}>
                <span>
                  <span className="hs-stat-name">
                    {metric.name}:{" "}
                  </span>

                  <span className="hs-stat-value">
                    {available
                      ? `${value}${metric.unit}`
                      : "No data"}
                  </span>
                </span>

                <span
                  className={
                    "hs-status " +
                    (available
                      ? normal
                        ? "hs-normal"
                        : "hs-abnormal"
                      : "")
                  }
                >
                  {available
                    ? normal
                      ? "Within reference range"
                      : "Outside reference range"
                    : "Not recorded"}
                </span>

                <button
                  className="hs-button"
                  disabled={!available}
                  onClick={() =>
                    onSeeTrends(metric.key)
                  }
                >
                  See Trends
                </button>
              </div>
            );
          })}

        <div className="hs-footer">
          <button
            className="hs-button"
            onClick={() => navigate("/dashboard")}
          >
            Back
          </button>
        </div>
      </main>

      {!loading && !error && (
        <p className="hs-time">
          {latest
            ? `Latest measurement: ${latest.recordedAt} UTC`
            : "No measurements recorded yet"}
        </p>
      )}
    </div>
  );
}
