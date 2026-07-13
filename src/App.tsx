import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Heart, RefreshCw } from 'lucide-react'
import CurrentWeatherCard from './components/CurrentWeatherCard'
import DailyForecast from './components/DailyForecast'
import FavoritesPanel from './components/FavoritesPanel'
import HourlyForecast from './components/HourlyForecast'
import Modal from './components/Modal'
import NWLogo from './components/NWLogo'
import RecentSearches from './components/RecentSearches'
import SearchBar from './components/SearchBar'
import StatsGrid from './components/StatsGrid'
import WeatherAnimation from './components/WeatherAnimation'
import { useLocalStorage } from './hooks/useLocalStorage'
import { fetchForecast } from './lib/openMeteo'
import type { ForecastBundle } from './lib/openMeteo'
import type { GeocodingPlace } from './lib/types'
import {
  isSamePlace,
  placeKey,
  placeLabel,
  type SavedPlace,
  weatherTheme,
} from './lib/weatherUtils'

const FAVORITES_KEY = 'nw:favorites'
const RECENTS_KEY = 'nw:recents'
const LAST_PLACE_KEY = 'nw:lastPlace'

function toSavedPlace(place: GeocodingPlace | SavedPlace): SavedPlace {
  return {
    name: place.name,
    country: place.country,
    latitude: place.latitude,
    longitude: place.longitude,
  }
}

export default function App() {
  const [favorites, setFavorites] = useLocalStorage<SavedPlace[]>(FAVORITES_KEY, [])
  const [recents, setRecents] = useLocalStorage<SavedPlace[]>(RECENTS_KEY, [])
  const [lastPlace, setLastPlace] = useLocalStorage<SavedPlace | null>(LAST_PLACE_KEY, null)

  const [activePlace, setActivePlace] = useState<SavedPlace | null>(null)
  const [forecast, setForecast] = useState<ForecastBundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [geoModalOpen, setGeoModalOpen] = useState(false)
  const [geoModalMessage, setGeoModalMessage] = useState('')
  const bootstrapped = useRef(false)

  const loadPlace = useCallback(async (place: SavedPlace) => {
    setLoading(true)
    setError(null)
    setActivePlace(place)
    setLastPlace(place)

    try {
      const data = await fetchForecast({
        latitude: place.latitude,
        longitude: place.longitude,
      })
      setForecast(data)

      setRecents((prev) => {
        const next = [place, ...prev.filter((p) => !isSamePlace(p, place))]
        return next.slice(0, 8)
      })
    } catch (err) {
      setForecast(null)
      setError(err instanceof Error ? err.message : 'Failed to load weather data.')
    } finally {
      setLoading(false)
    }
  }, [setLastPlace, setRecents])

  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoModalMessage('Geolocation is not supported by your browser.')
      setGeoModalOpen(true)
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const place: SavedPlace = {
          name: 'Current Location',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }
        await loadPlace(place)
      },
      (geoErr) => {
        setLoading(false)
        setGeoModalMessage(
          geoErr.code === geoErr.PERMISSION_DENIED
            ? 'Location permission was denied. Search for a city or enable location access in your browser settings.'
            : 'Unable to determine your location. Please try again or search for a city.'
        )
        setGeoModalOpen(true)
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    )
  }, [loadPlace])

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    if (lastPlace) {
      void loadPlace(lastPlace)
    } else {
      requestCurrentLocation()
    }
  }, [lastPlace, loadPlace, requestCurrentLocation])

  const isFavorite = useMemo(() => {
    if (!activePlace) return false
    return favorites.some((f) => isSamePlace(f, activePlace))
  }, [activePlace, favorites])

  function handleSelectPlace(place: GeocodingPlace) {
    void loadPlace(toSavedPlace(place))
  }

  function toggleFavorite() {
    if (!activePlace) return
    if (isFavorite) {
      setFavorites((prev) => prev.filter((f) => !isSamePlace(f, activePlace)))
    } else {
      setFavorites((prev) => {
        const next = [activePlace, ...prev.filter((f) => !isSamePlace(f, activePlace))]
        return next.slice(0, 12)
      })
    }
  }

  function removeFavorite(place: SavedPlace) {
    setFavorites((prev) => prev.filter((f) => !isSamePlace(f, place)))
  }

  function removeRecent(place: SavedPlace) {
    setRecents((prev) => prev.filter((p) => !isSamePlace(p, place)))
  }

  const theme = weatherTheme(forecast?.current.condition?.code)
  const locationLabel = activePlace ? placeLabel(activePlace.name, activePlace.country) : '—'

  return (
    <div className="page">
      <WeatherAnimation theme={theme} />

      <div className="shell">
        <header className="header">
          <div className="brand">
            <div className="logo">
              <NWLogo size={36} />
            </div>
            <div>
              <h1>Nilkantha Weather</h1>
              <p>Live forecasts powered by Open-Meteo</p>
            </div>
          </div>

          <div className="topActions">
            <SearchBar
              onSelect={handleSelectPlace}
              onUseLocation={requestCurrentLocation}
              disabled={loading}
            />
            <button
              className={`iconBtn ${isFavorite ? 'iconBtn--active' : ''}`}
              type="button"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              disabled={!activePlace || loading}
              onClick={toggleFavorite}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              className="iconBtn"
              type="button"
              aria-label="Refresh weather"
              disabled={!activePlace || loading}
              onClick={() => activePlace && void loadPlace(activePlace)}
            >
              <RefreshCw size={16} className={loading ? 'spin' : undefined} />
            </button>
          </div>
        </header>

        {error ? <div className="error">{error}</div> : null}

        {loading && !forecast ? (
          <div className="grid">
            <div className="glass panel">
              <div className="skel" style={{ height: 120, marginBottom: 12 }} />
              <div className="skel" />
            </div>
            <div className="glass panel">
              <div className="skel" style={{ height: 220 }} />
            </div>
          </div>
        ) : null}

        {forecast ? (
          <>
            <div className="grid">
              <div className="stack">
                <CurrentWeatherCard
                  locationName={locationLabel}
                  current={forecast.current}
                  timezone={forecast.timezone}
                />
                <StatsGrid current={forecast.current} />
              </div>
              <div className="stack">
                <FavoritesPanel
                  favorites={favorites}
                  active={activePlace}
                  onSelect={(p) => void loadPlace(p)}
                  onRemove={removeFavorite}
                />
                <RecentSearches
                  recents={recents}
                  active={activePlace}
                  onSelect={(p) => void loadPlace(p)}
                  onRemove={removeRecent}
                  onClear={() => setRecents([])}
                />
              </div>
            </div>

            <div className="stack" style={{ marginTop: 14 }}>
              <HourlyForecast hourly={forecast.hourly} timezone={forecast.timezone} />
              <DailyForecast daily={forecast.daily} timezone={forecast.timezone} />
            </div>
          </>
        ) : null}

        <footer className="footer">
          <span>Data from Open-Meteo</span>
          <span key={activePlace ? placeKey(activePlace) : 'none'}>
            {activePlace
              ? `${activePlace.latitude.toFixed(2)}°, ${activePlace.longitude.toFixed(2)}°`
              : ''}
          </span>
        </footer>
      </div>

      <Modal
        title="Location unavailable"
        isOpen={geoModalOpen}
        confirmText="OK"
        onConfirm={() => setGeoModalOpen(false)}
        onCancel={() => setGeoModalOpen(false)}
      >
        {geoModalMessage}
      </Modal>
    </div>
  )
}
