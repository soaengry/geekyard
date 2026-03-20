import { FC, useState } from 'react'
import { useScrollLock } from '../../../global/hooks/useScrollLock'
import AnimeDetailModal from '../../anime/components/AnimeDetailModal'
import type { WatchedCalendarItem } from '../../anime/types'

interface WatchedDateModalProps {
  date: string
  items: WatchedCalendarItem[]
  onClose: () => void
}

const WatchedDateModal: FC<WatchedDateModalProps> = ({ date, items, onClose }) => {
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null)
  useScrollLock(true)

  return (
    <>
      <div
        className="watched-date-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="watched-date-modal relative z-10 bg-surface rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="watched-date-modal-header flex items-center justify-between p-4 border-b border-content/10">
            <h2 className="text-lg font-bold text-content">{date} 본 작품</h2>
            <button
              onClick={onClose}
              className="watched-date-modal-close text-subtle hover:text-content transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          <div className="watched-date-modal-body p-4 overflow-y-auto hover-scrollbar">
            <p className="text-sm text-subtle mb-3">
              총 {items.length}개
            </p>
            <div className="watched-date-modal-list space-y-3">
              {items.map((item) => (
                <button
                  key={item.animeId}
                  onClick={() => setSelectedAnimeId(item.animeId)}
                  className="watched-date-item flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-content/5 transition-colors"
                >
                  {item.animeImg ? (
                    <img
                      src={item.animeImg}
                      alt={item.animeName}
                      className="watched-date-item-img w-12 h-16 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="watched-date-item-placeholder w-12 h-16 rounded-md bg-content/10 shrink-0" />
                  )}
                  <div className="watched-date-item-info min-w-0 flex-1">
                    <p className="text-sm font-medium text-content truncate">
                      {item.animeName}
                    </p>
                    {item.score !== null && (
                      <p className="text-xs text-subtle mt-0.5">
                        내 평점: {item.score}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedAnimeId !== null && (
        <AnimeDetailModal
          id={selectedAnimeId}
          onClose={() => setSelectedAnimeId(null)}
        />
      )}
    </>
  )
}

export default WatchedDateModal
