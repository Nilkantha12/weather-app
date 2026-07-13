import { useEffect, useRef, useState } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import type { GeocodingPlace } from '../lib/types'
import { searchPlaces } from '../lib/openMeteo'
import { placeLabel } from '../lib/weatherUtils'

type SearchBarProps = {
  onSelect: (place: GeocodingPlace) => void
  onUseLocation: () => void
  disabled?: boolean
}

export default function SearchBar({ onSelect, onUseLocation, disabled }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodingPlace[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const places = await searchPlaces(query.trim(), 6)
        setResults(places)
        setOpen(places.length > 0)
      } catch {
        setResults([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 350)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <div className="searchWrap" ref={wrapRef}>
      <div className="glass search">
        <Search size={18} opacity={0.75} />
        <input
          type="search"
          placeholder="Search city…"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Search for a city"
        />
        {query ? (
          <button
            className="iconBtn"
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('')
              setResults([])
              setOpen(false)
            }}
          >
            <X size={16} />
          </button>
        ) : null}
        <button
          className="iconBtn"
          type="button"
          aria-label="Use current location"
          disabled={disabled}
          onClick={onUseLocation}
        >
          <MapPin size={16} />
        </button>
      </div>

      {open ? (
        <div className="glass searchDropdown" role="listbox">
          {loading ? <div className="searchItem muted">Searching…</div> : null}
          {results.map((place) => (
            <button
              key={`${place.latitude}-${place.longitude}-${place.name}`}
              type="button"
              className="searchItem"
              role="option"
              onClick={() => {
                onSelect(place)
                setQuery('')
                setResults([])
                setOpen(false)
              }}
            >
              {placeLabel(place.name, place.country)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
