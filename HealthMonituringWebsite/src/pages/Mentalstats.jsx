import StatsScreen from "./Statsscreen";
import { useHealthMetrics } from "./Healthdata";

export default function MentalStats({ onSeeTrends }) {
  const { metrics, loading, error } =
    useHealthMetrics("mental");

  return (
    <StatsScreen
      title="Mental Health Stats (Today)"
      metrics={metrics}
      loading={loading}
      error={error}
      active="mental"
      onSeeTrends={onSeeTrends}
    />
  );
}
