export type WeatherTheme = 'clear' | 'partly' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog'

export type SavedPlace = {
  name: string
  country?: string
  latitude: number
  longitude: number
}

export function weatherCodeDescription(code?: number): string {
  if (code == null) return 'Unknown'
  if (code === 0) return 'Clear sky'
  if (code <= 2) return 'Partly cloudy'
  if (code <= 3) return 'Overcast'
  if (code <= 48) return 'Foggy'
  if (code <= 57) return 'Drizzle'
  if (code <= 67) return 'Rain'
  if (code <= 77) return 'Snow'
  if (code <= 82) return 'Rain showers'
  if (code <= 86) return 'Snow showers'
  if (code <= 95) return 'Thunderstorm'
  return 'Weather'
}

export function weatherTheme(code?: number): WeatherTheme {
  if (code == null) return 'cloudy'
  if (code === 0) return 'clear'
  if (code <= 2) return 'partly'
  if (code <= 48) return 'fog'
  if (code <= 67) return 'rain'
  if (code <= 77) return 'snow'
  if (code <= 86) return 'snow'
  if (code <= 95) return 'storm'
  return 'cloudy'
}

export function formatTemp(c?: number): string {
  if (c == null || Number.isNaN(c)) return '—'
  return `${Math.round(c)}°`
}

export function formatPct(v?: number): string {
  if (v == null || Number.isNaN(v)) return '—'
  return `${Math.round(v)}%`
}

export function formatWind(kph?: number): string {
  if (kph == null || Number.isNaN(kph)) return '—'
  return `${Math.round(kph)} km/h`
}

export function formatPressure(hpa?: number): string {
  if (hpa == null || Number.isNaN(hpa)) return '—'
  return `${Math.round(hpa)} hPa`
}

export function formatVisibility(km?: number): string {
  if (km == null || Number.isNaN(km)) return '—'
  if (km >= 10) return `${Math.round(km)} km`
  return `${km.toFixed(1)} km`
}

export function formatUv(uv?: number): string {
  if (uv == null || Number.isNaN(uv)) return '—'
  return uv.toFixed(1)
}

export function formatTime(iso?: string, timezone?: string): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone || undefined,
    })
  } catch {
    return iso
  }
}

export function formatDate(iso?: string, timezone?: string): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: timezone || undefined,
    })
  } catch {
    return iso
  }
}

export function formatHour(iso: string, timezone?: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      timeZone: timezone || undefined,
    })
  } catch {
    return iso
  }
}

export function placeLabel(name: string, country?: string): string {
  return country ? `${name}, ${country}` : name
}

export function placeKey(p: SavedPlace): string {
  return `${p.latitude.toFixed(4)},${p.longitude.toFixed(4)}`
}

export function isSamePlace(a: SavedPlace, b: SavedPlace): boolean {
  return placeKey(a) === placeKey(b)
}
