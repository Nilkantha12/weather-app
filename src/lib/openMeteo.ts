import type { Coords, CurrentWeather, DailyPoint, GeocodingPlace, HourlyPoint } from './types'

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1'
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1'

type GeocodeSearchResponse = {
  results?: Array<{
    id?: number
    name: string
    latitude: number
    longitude: number
    country?: string
    timezone?: string
  }>
}

type ForecastResponse = {
  latitude: number
  longitude: number
  timezone: string
  timezone_abbreviation?: string
  current?: Record<string, unknown>
  hourly?: Record<string, unknown>
  daily?: Record<string, unknown>
}

function pickNumber(v: unknown): number | undefined {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v))) return Number(v)
  return undefined
}


function weatherCodeDescription(code?: number) {
  // Lightweight mapping; presentation handled in UI.
  // Open-Meteo uses WMO weather codes.
  if (code == null) return 'Unknown'
  if (code === 0) return 'Clear sky'
  if (code <= 2) return 'Partly cloudy'
  if (code <= 48) return 'Cloudy'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow & sleet'
  if (code <= 82) return 'Rain showers'
  if (code <= 86) return 'Snow showers'
  if (code <= 95) return 'Thunderstorm'
  return 'Weather'
}

export async function searchPlaces(query: string, count = 5): Promise<GeocodingPlace[]> {
  const url = new URL(`${GEOCODING_BASE}/search`)
  url.searchParams.set('name', query)
  url.searchParams.set('count', String(count))
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`Geocoding failed: ${res.status} ${res.statusText}`)
  }

  const json = (await res.json()) as GeocodeSearchResponse
  const results = json.results ?? []
  return results.map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    timezone: r.timezone,
  }))
}

export type ForecastBundle = {
  coords: Coords
  timezone: string
  current: CurrentWeather
  hourly: HourlyPoint[]
  daily: DailyPoint[] // next days (server range configured)
}

export async function fetchForecast(coords: Coords): Promise<ForecastBundle> {
  const url = new URL(`${OPEN_METEO_BASE}/forecast`)

  url.searchParams.set('latitude', String(coords.latitude))
  url.searchParams.set('longitude', String(coords.longitude))
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '5')

  // Current — only documented variables (time is returned automatically)
  url.searchParams.set(
    'current',
    [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'pressure_msl',
      'visibility',
      'cloud_cover',
      'precipitation_probability',
      'weather_code',
      'uv_index',
    ].join(',')
  )

  // Hourly — do not request "time"; API always includes it
  url.searchParams.set(
    'hourly',
    [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'cloud_cover',
      'wind_speed_10m',
      'weather_code',
    ].join(',')
  )

  // Daily — use precipitation_probability_mean (rain_probability_mean is invalid)
  url.searchParams.set(
    'daily',
    [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_mean',
      'weather_code',
      'sunrise',
      'sunset',
      'uv_index_max',
    ].join(',')
  )

  const requestUrl = url.toString()
  console.log('[Open-Meteo] Forecast request:', requestUrl)

  const res = await fetch(requestUrl)
  if (!res.ok) {
    throw new Error(`Forecast failed: ${res.status} ${res.statusText}`)
  }

  const json = (await res.json()) as ForecastResponse

  const timezone = (json.timezone as string) || 'auto'
  const cur = json.current ?? {}

  const weatherCode = pickNumber(cur['weather_code'])
  const current: CurrentWeather = {
    temperatureC: pickNumber(cur['temperature_2m']) ?? 0,
    feelsLikeC: pickNumber(cur['apparent_temperature']),
    humidityPct: pickNumber(cur['relative_humidity_2m']),
    windKph: pickNumber(cur['wind_speed_10m']),
    pressureHpa: pickNumber(cur['pressure_msl']),
    visibilityKm: (() => {
      const m = pickNumber(cur['visibility'])
      return m != null ? m / 1000 : undefined
    })(),
    cloudCoverPct: pickNumber(cur['cloud_cover']),
    rainProbabilityPct: pickNumber(cur['precipitation_probability']),
    uvIndex: pickNumber(cur['uv_index']),
    sunrise: undefined,
    sunset: undefined,
    timezone,
    condition: {
      code: weatherCode,
      description: weatherCodeDescription(weatherCode),
    },
  }

  // Daily sunrise/sunset: take first daily entry if present.
  const daily = (json.daily ?? {}) as Record<string, unknown>
  const dailyTimes = daily['time'] as string[] | undefined
  const dailySunrise = daily['sunrise'] as string[] | undefined
  const dailySunset = daily['sunset'] as string[] | undefined
  if (dailyTimes && dailySunrise && dailySunrise[0]) current.sunrise = dailySunrise[0]
  if (dailyTimes && dailySunset && dailySunset[0]) current.sunset = dailySunset[0]

  const hourlyArr: HourlyPoint[] = []
  const hourly = (json.hourly ?? {}) as Record<string, unknown>
  const times = hourly['time'] as string[] | undefined
  if (times) {
    for (let i = 0; i < times.length; i++) {
      const t = times[i]
      const temp = (hourly['temperature_2m'] as number[] | undefined)?.[i]
      if (typeof temp !== 'number') continue

      hourlyArr.push({
        time: t,
        temperatureC: temp,
        feelsLikeC: (hourly['apparent_temperature'] as number[] | undefined)?.[i],
        precipitationProbabilityPct: (hourly['precipitation_probability'] as number[] | undefined)?.[i],
        rainProbabilityPct: (hourly['precipitation_probability'] as number[] | undefined)?.[i],
        cloudCoverPct: (hourly['cloud_cover'] as number[] | undefined)?.[i],
        windKph: (hourly['wind_speed_10m'] as number[] | undefined)?.[i],
        weatherCode: (hourly['weather_code'] as number[] | undefined)?.[i],
      })
    }
  }

  if (current.rainProbabilityPct == null && hourlyArr.length > 0) {
    const now = Date.now()
    const nearest = hourlyArr.find((h) => new Date(h.time).getTime() >= now) ?? hourlyArr[0]
    current.rainProbabilityPct =
      nearest.rainProbabilityPct ?? nearest.precipitationProbabilityPct
  }

  const dailyPoints: DailyPoint[] = []
  if (dailyTimes) {
    for (let i = 0; i < dailyTimes.length; i++) {
      const date = dailyTimes[i]
      const max = (daily['temperature_2m_max'] as number[] | undefined)?.[i]
      const min = (daily['temperature_2m_min'] as number[] | undefined)?.[i]
      if (typeof max !== 'number' || typeof min !== 'number') continue

      dailyPoints.push({
        date,
        minTempC: min,
        maxTempC: max,
        precipitationProbabilityPct: (daily['precipitation_probability_mean'] as number[] | undefined)?.[i],
        rainProbabilityPct: (daily['precipitation_probability_mean'] as number[] | undefined)?.[i],
        weatherCode: (daily['weather_code'] as number[] | undefined)?.[i],
        sunrise: (dailySunrise?.[i] as string | undefined) ?? undefined,
        sunset: (dailySunset?.[i] as string | undefined) ?? undefined,
        uvIndexMax: (daily['uv_index_max'] as number[] | undefined)?.[i],
      })
    }
  }

  return {
    coords,
    timezone,
    current,
    hourly: hourlyArr,
    daily: dailyPoints,
  }
}
