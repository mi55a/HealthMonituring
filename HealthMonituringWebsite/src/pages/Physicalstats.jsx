import StatsScreen from "./Statsscreen";
import { useHealthMetrics } from "./Healthdata";

export default function PhysicalStats({ onSeeTrends }) {
  const { metrics, loading, error } =
    useHealthMetrics("physical");

  return (
    <StatsScreen
      title="Physical Health Stats (Today)"
      metrics={metrics}
      loading={loading}
      error={error}
      active="physical"
      onSeeTrends={onSeeTrends}
    />
  );
}
