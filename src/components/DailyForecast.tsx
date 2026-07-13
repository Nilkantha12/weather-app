import type { DailyPoint } from '../lib/types'
import { formatDate, formatPct, formatTemp, weatherCodeDescription } from '../lib/weatherUtils'

type DailyForecastProps = {
  daily: DailyPoint[]
  timezone?: string
}

export default function DailyForecast({ daily, timezone }: DailyForecastProps) {
  const days = daily.slice(0, 5)
  if (days.length === 0) return null

  return (
    <section className="glass panel">
      <div className="sectionTitle">
        <h2>5-Day Forecast</h2>
      </div>
      <div className="dailyList">
        {days.map((d) => (
          <div key={d.date} className="dailyRow">
            <div className="dailyDate">{formatDate(d.date, timezone)}</div>
            <div className="dailyCond">{weatherCodeDescription(d.weatherCode)}</div>
            <div className="dailyRain">{formatPct(d.rainProbabilityPct ?? d.precipitationProbabilityPct)}</div>
            <div className="dailyTemps">
              <span className="dailyMax">{formatTemp(d.maxTempC)}</span>
              <span className="dailyMin">{formatTemp(d.minTempC)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
