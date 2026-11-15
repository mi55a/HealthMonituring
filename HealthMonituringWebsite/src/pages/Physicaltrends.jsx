import TrendScreen from './Trendscreen'
import { PHYSICAL_METRICS } from './Healthdata'

export default function PhysicalTrend({ metricKey, onBack }) {
  const metric = PHYSICAL_METRICS.find((m) => m.key === metricKey)
  const title = metric ? metric.name + ' (past 3 days):' : 'Trend not found'
  return <TrendScreen title={title} metric={metric} onBack={onBack} />
}