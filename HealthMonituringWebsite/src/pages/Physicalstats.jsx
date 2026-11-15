import StatsScreen from './Statsscreen'
import { PHYSICAL_METRICS } from './Healthdata'

export default function PhysicalStats({ onSeeTrends, onBack, onSwitch }) {
  return (
    <StatsScreen
      title="Physical Health Stats (Today)"
      metrics={PHYSICAL_METRICS}
      active="physical"
      onSwitch={onSwitch}
      onSeeTrends={onSeeTrends}
    />
  )
}