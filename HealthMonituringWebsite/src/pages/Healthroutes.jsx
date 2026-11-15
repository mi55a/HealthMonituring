import { useNavigate, useParams } from 'react-router-dom'
import PhysicalStats from './Physicalstats'
import PhysicalTrend from './Physicaltrends'
import MentalStats from './Mentalstats'
import MentalTrend from './Mentaltrends'

export function PhysicalStatsPage() {
  const navigate = useNavigate()
  return (
    <PhysicalStats
      onSwitch={(which) => navigate(which === 'mental' ? '/mental-stats' : '/physical-stats')}
      onSeeTrends={(key) => navigate('/physical-trend/' + key)}
      onBack={() => navigate('/dashboard')}
    />
  )
}

export function PhysicalTrendPage() {
  const { metricKey } = useParams()
  const navigate = useNavigate()
  return (
    <PhysicalTrend metricKey={metricKey} onBack={() => navigate('/physical-stats')} />
  )
}

export function MentalStatsPage() {
  const navigate = useNavigate()
  return (
    <MentalStats
      onSwitch={(which) => navigate(which === 'mental' ? '/mental-stats' : '/physical-stats')}
      onSeeTrends={(key) => navigate('/mental-trend/' + key)}
      onBack={() => navigate('/dashboard')}
    />
  )
}

export function MentalTrendPage() {
  const { metricKey } = useParams()
  const navigate = useNavigate()
  return (
    <MentalTrend metricKey={metricKey} onBack={() => navigate('/mental-stats')} />
  )
}