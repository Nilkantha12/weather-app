import { Sunrise, Sunset } from 'lucide-react'
import type { CurrentWeather } from '../lib/types'
import { formatTemp, formatTime } from '../lib/weatherUtils'

type CurrentWeatherCardProps = {
  locationName: string
  current: CurrentWeather
  timezone?: string
}

export default function CurrentWeatherCard({ locationName, current, timezone }: CurrentWeatherCardProps) {
  return (
    <section className="glass panel">
      <div className="cardRow">
        <div>
          <div className="badge">{locationName}</div>
          <div className="bigTemp" style={{ marginTop: 14 }}>
            <span className="temp">{formatTemp(current.temperatureC)}</span>
            <span className="unit">C</span>
          </div>
          <p className="kicker">{current.condition?.description ?? 'Current conditions'}</p>
        </div>
        <div className="sunTimes">
          <div className="sunTime">
            <Sunrise size={16} />
            <span>{formatTime(current.sunrise, timezone)}</span>
          </div>
          <div className="sunTime">
            <Sunset size={16} />
            <span>{formatTime(current.sunset, timezone)}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
