export type Coords = {
  latitude: number
  longitude: number
}

export type GeocodingPlace = {
  id?: number
  name: string
  latitude: number
  longitude: number
  country?: string
  timezone?: string
}

export type WeatherCondition = {
  code?: number
  description: string
  icon?: string
}

export type CurrentWeather = {
  temperatureC: number
  feelsLikeC?: number
  humidityPct?: number
  windKph?: number
  pressureHpa?: number
  visibilityKm?: number
  cloudCoverPct?: number
  rainProbabilityPct?: number
  uvIndex?: number

  sunrise?: string
  sunset?: string

  timezone?: string
  localTime?: string

  condition?: WeatherCondition
}

export type HourlyPoint = {
  time: string
  temperatureC: number
  feelsLikeC?: number
  precipitationProbabilityPct?: number
  rainProbabilityPct?: number
  cloudCoverPct?: number
  windKph?: number
  weatherCode?: number
}

export type DailyPoint = {
  date: string
  minTempC: number
  maxTempC: number
  precipitationProbabilityPct?: number
  rainProbabilityPct?: number
  weatherCode?: number
  sunrise?: string
  sunset?: string
  uvIndexMax?: number
}
