import { Clock, X } from 'lucide-react'
import type { SavedPlace } from '../lib/weatherUtils'
import { isSamePlace, placeLabel } from '../lib/weatherUtils'

type RecentSearchesProps = {
  recents: SavedPlace[]
  active?: SavedPlace | null
  onSelect: (place: SavedPlace) => void
  onRemove: (place: SavedPlace) => void
  onClear: () => void
}

export default function RecentSearches({ recents, active, onSelect, onRemove, onClear }: RecentSearchesProps) {
  if (recents.length === 0) {
    return (
      <section className="glass panel">
        <div className="sectionTitle">
          <h2>
            <Clock size={14} style={{ display: 'inline', marginRight: 6 }} />
            Recent Searches
          </h2>
        </div>
        <p className="kicker">Your recently viewed cities will appear here.</p>
      </section>
    )
  }

  return (
    <section className="glass panel">
      <div className="sectionTitle">
        <h2>
          <Clock size={14} style={{ display: 'inline', marginRight: 6 }} />
          Recent Searches
        </h2>
        <button type="button" className="textBtn" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="chipList">
        {recents.map((place) => {
          const isActive = active && isSamePlace(active, place)
          return (
            <div key={`${place.latitude}-${place.longitude}`} className={`chip ${isActive ? 'chip--active' : ''}`}>
              <button type="button" className="chipBtn" onClick={() => onSelect(place)}>
                {placeLabel(place.name, place.country)}
              </button>
              <button
                type="button"
                className="chipRemove"
                aria-label={`Remove ${place.name} from recents`}
                onClick={() => onRemove(place)}
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
