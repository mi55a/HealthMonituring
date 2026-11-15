import StatsScreen from './Statsscreen'
import { MENTAL_METRICS } from './Healthdata'

export default function MentalStats({ onSeeTrends, onBack, onSwitch }) {
  return (
    <StatsScreen
      title="Mental Health Stats (Today)"
      metrics={MENTAL_METRICS}
      active="mental"
      onSwitch={onSwitch}
      onSeeTrends={onSeeTrends}
      onBack={onBack}
    />
  )
}