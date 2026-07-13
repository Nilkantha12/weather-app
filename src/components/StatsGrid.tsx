import {
  Cloud,
  CloudRain,
  Droplets,
  Eye,
  Gauge,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react'
import type { CurrentWeather } from '../lib/types'
import {
  formatPct,
  formatPressure,
  formatTemp,
  formatUv,
  formatVisibility,
  formatWind,
} from '../lib/weatherUtils'

type StatsGridProps = {
  current: CurrentWeather
}

const stats = [
  { key: 'feelsLikeC', label: 'Feels Like', icon: Thermometer, format: formatTemp },
  { key: 'humidityPct', label: 'Humidity', icon: Droplets, format: formatPct },
  { key: 'windKph', label: 'Wind Speed', icon: Wind, format: formatWind },
  { key: 'pressureHpa', label: 'Pressure', icon: Gauge, format: formatPressure },
  { key: 'visibilityKm', label: 'Visibility', icon: Eye, format: formatVisibility },
  { key: 'cloudCoverPct', label: 'Cloud Cover', icon: Cloud, format: formatPct },
  { key: 'rainProbabilityPct', label: 'Rain Probability', icon: CloudRain, format: formatPct },
  { key: 'uvIndex', label: 'UV Index', icon: Sun, format: formatUv },
] as const

export default function StatsGrid({ current }: StatsGridProps) {
  return (
    <section className="glass panel">
      <div className="sectionTitle">
        <h2>Details</h2>
      </div>
      <div className="statGrid">
        {stats.map(({ key, label, icon: Icon, format }) => (
          <div key={key} className="stat">
            <div className="label">
              <Icon size={14} />
              {label}
            </div>
            <div className="value">{format(current[key])}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
