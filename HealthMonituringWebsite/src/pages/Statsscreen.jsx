import HealthHeader from './Healthheader'
import { getCurrent, isNormal } from './Healthdata'
import { Navigate, useNavigate } from 'react-router-dom';

export default function StatsScreen({ title, metrics, active, onSwitch, onSeeTrends }) {
  const navigate = useNavigate();
  return (
    <div className="hs-page">
      <HealthHeader title={title} />

      <div className="hs-switch">
        <button
          className={'hs-switch-button' + (active === 'physical' ? ' hs-switch-active' : '')}
          onClick={() => navigate("/physical-stats")}
        >
          Physical Health
        </button>
        <button
          className={'hs-switch-button' + (active === 'mental' ? ' hs-switch-active' : '')}
          onClick={() => navigate("/mental-stats")}
        >
          Mental Health
        </button>
      </div>

      <main className="hs-card">
        {metrics.map((metric) => {
          const value = getCurrent(metric)
          const normal = isNormal(metric, value)
          return (
            <div className="hs-row" key={metric.key}>
              <span>
                <span className="hs-stat-name">{metric.name}: </span>
                <span className="hs-stat-value">
                  {value}
                  {metric.unit}
                </span>
              </span>
              <span className={'hs-status ' + (normal ? 'hs-normal' : 'hs-abnormal')}>
                {normal ? 'Normal' : 'Abnormal'}
              </span>
              <button className="hs-button" onClick={() => onSeeTrends(metric.key)}>
                See Trends
              </button>
            </div>
          )
        })}
        <div className="hs-footer">
          <button className="hs-button" onClick={() => navigate("/dashboard")}>
            Back
          </button>
        </div>
      </main>
      <p className="hs-time">Time collected: 10:00 AM CST</p>
    </div>
  )
}