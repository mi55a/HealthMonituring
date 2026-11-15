import TrendScreen from "./Trendscreen";
import { useHealthMetrics } from "./Healthdata";

export default function PhysicalTrend({ metricKey }) {
  const { metrics, loading, error } =
    useHealthMetrics("physical");

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
      backPath="/physical-stats"
    />
  );
}
