import type { HourlyPoint } from '../lib/types'
import { formatHour, formatPct, formatTemp, weatherCodeDescription } from '../lib/weatherUtils'

type HourlyForecastProps = {
  hourly: HourlyPoint[]
  timezone?: string
}

export default function HourlyForecast({ hourly, timezone }: HourlyForecastProps) {
  const now = Date.now()
  const upcoming = hourly
    .filter((h) => new Date(h.time).getTime() >= now - 30 * 60 * 1000)
    .slice(0, 24)

  if (upcoming.length === 0) return null

  return (
    <section className="glass panel">
      <div className="sectionTitle">
        <h2>Hourly Forecast</h2>
      </div>
      <div className="strip">
        {upcoming.map((h) => (
          <div key={h.time} className="hourCard">
            <div className="time">{formatHour(h.time, timezone)}</div>
            <div className="t">{formatTemp(h.temperatureC)}</div>
            <div className="hourMeta">{weatherCodeDescription(h.weatherCode)}</div>
            <div className="hourMeta">{formatPct(h.rainProbabilityPct ?? h.precipitationProbabilityPct)} rain</div>
          </div>
        ))}
      </div>
    </section>
  )
}
