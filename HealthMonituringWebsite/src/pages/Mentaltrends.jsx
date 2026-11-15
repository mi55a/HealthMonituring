import TrendScreen from "./Trendscreen";
import { useHealthMetrics } from "./Healthdata";

export default function MentalTrend({ metricKey }) {
  const { metrics, loading, error } =
    useHealthMetrics("mental");

  const metric = metrics.find(
    (m) => m.key === metricKey
  );

  return (
    <TrendScreen
      title={
        metric
          ? `${metric.name} (saved history)`
          : "Health Trend"
      }
      metric={metric}
      loading={loading}
      error={error}
      backPath="/mental-stats"
    />
  );
}
