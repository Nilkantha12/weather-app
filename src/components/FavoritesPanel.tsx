import { Heart, X } from 'lucide-react'
import type { SavedPlace } from '../lib/weatherUtils'
import { isSamePlace, placeLabel } from '../lib/weatherUtils'

type FavoritesPanelProps = {
  favorites: SavedPlace[]
  active?: SavedPlace | null
  onSelect: (place: SavedPlace) => void
  onRemove: (place: SavedPlace) => void
}

export default function FavoritesPanel({ favorites, active, onSelect, onRemove }: FavoritesPanelProps) {
  if (favorites.length === 0) {
    return (
      <section className="glass panel">
        <div className="sectionTitle">
          <h2>
            <Heart size={14} style={{ display: 'inline', marginRight: 6 }} />
            Favorites
          </h2>
        </div>
        <p className="kicker">Save cities with the heart button to access them quickly.</p>
      </section>
    )
  }

  return (
    <section className="glass panel">
      <div className="sectionTitle">
        <h2>
          <Heart size={14} style={{ display: 'inline', marginRight: 6 }} />
          Favorites
        </h2>
      </div>
      <div className="chipList">
        {favorites.map((place) => {
          const isActive = active && isSamePlace(active, place)
          return (
            <div key={`${place.latitude}-${place.longitude}`} className={`chip ${isActive ? 'chip--active' : ''}`}>
              <button type="button" className="chipBtn" onClick={() => onSelect(place)}>
                {placeLabel(place.name, place.country)}
              </button>
              <button
                type="button"
                className="chipRemove"
                aria-label={`Remove ${place.name} from favorites`}
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
