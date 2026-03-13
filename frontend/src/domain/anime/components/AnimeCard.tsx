import { FC } from 'react'
import type { AnimeListItem } from '../types'

interface AnimeCardProps {
  anime: AnimeListItem
  onSelect: (id: number) => void
}

const AnimeCard: FC<AnimeCardProps> = ({ anime, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(anime.id)}
      className="anime-card group relative block overflow-hidden rounded-lg bg-surface shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
    >
      <div className="anime-card-thumbnail relative aspect-[2/3] overflow-hidden bg-content/10">
        {anime.img ? (
          <img
            src={anime.img}
            alt={anime.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-subtle text-sm">
            이미지 없음
          </div>
        )}

        {anime.avgRating != null && (
          <div className="anime-card-rating absolute top-2 right-2 bg-black/70 text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded">
            ★ {anime.avgRating.toFixed(1)}
          </div>
        )}

        {anime.isAdult && (
          <div className="anime-card-adult-badge absolute top-2 left-2 bg-error text-white text-xs font-bold px-1.5 py-0.5 rounded">
            19+
          </div>
        )}

        <div className="anime-card-info absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="anime-card-title text-white text-sm font-semibold line-clamp-2 leading-tight">{anime.name}</p>
          {anime.genres && anime.genres.length > 0 && (
            <div className="anime-card-genres flex flex-wrap gap-1 mt-1">
              {anime.genres.slice(0, 2).map((genre) => (
                <span
                  key={genre}
                  className="anime-card-genre text-white/70 text-xs bg-white/10 px-1.5 py-0.5 rounded"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnimeCard
