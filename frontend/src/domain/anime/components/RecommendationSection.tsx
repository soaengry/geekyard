import { FC, useEffect, useState } from 'react'
import { getRecommendations } from '../api/animeApi'
import type { RecommendationItem } from '../types'
import AnimeDetailModal from './AnimeDetailModal'

const RecommendationSection: FC = () => {
  const [items, setItems] = useState<RecommendationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    getRecommendations(10)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="recommendation-section mb-6">
        <h2 className="recommendation-title text-lg font-bold text-content mb-3">맞춤 추천</h2>
        <div className="recommendation-skeleton flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="recommendation-skeleton-card shrink-0 w-28 animate-pulse"
            >
              <div className="aspect-[2/3] rounded-lg bg-content/10" />
              <div className="h-3 bg-content/10 rounded mt-1.5 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  return (
    <>
      <div className="recommendation-section mb-6">
        <h2 className="recommendation-title text-lg font-bold text-content mb-3">맞춤 추천</h2>
        <div className="recommendation-list flex gap-3 overflow-x-auto pb-2">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className="recommendation-card shrink-0 w-28 cursor-pointer group"
            >
              <div className="recommendation-card-thumbnail relative aspect-[2/3] rounded-lg overflow-hidden bg-content/10">
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-subtle text-xs">
                    이미지 없음
                  </div>
                )}
                {item.avgRating != null && (
                  <div className="recommendation-card-rating absolute top-1 right-1 bg-black/70 text-yellow-400 text-[10px] font-bold px-1 py-0.5 rounded">
                    ★ {item.avgRating.toFixed(1)}
                  </div>
                )}
              </div>
              <p className="recommendation-card-title text-xs font-medium text-content mt-1.5 line-clamp-2 leading-tight">
                {item.name}
              </p>
              {item.genres.length > 0 && (
                <p className="recommendation-card-genres text-[10px] text-subtle mt-0.5 line-clamp-1">
                  {item.genres.slice(0, 2).join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedId && (
        <AnimeDetailModal id={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  )
}

export default RecommendationSection
