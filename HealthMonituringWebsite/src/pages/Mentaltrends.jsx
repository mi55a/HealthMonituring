import TrendScreen from './Trendscreen'
import { MENTAL_METRICS } from './Healthdata'

export default function MentalTrend({ metricKey, onBack }) {
  const metric = MENTAL_METRICS.find((m) => m.key === metricKey)
  const title = metric ? metric.name + ' (all time):' : 'Trend not found'
  return <TrendScreen title={title} metric={metric} onBack={onBack} />
}