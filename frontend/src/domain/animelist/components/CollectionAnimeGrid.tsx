import { FC, useState } from 'react'
import { toast } from 'react-toastify'
import { removeItemFromCollection } from '../api/animeListApi'
import { extractApiError } from '../../../global/utils/extractApiError'
import AnimeDetailModal from '../../anime/components/AnimeDetailModal'
import type { AnimeListItemInfo } from '../types'

interface CollectionAnimeGridProps {
  collectionId: number
  items: AnimeListItemInfo[]
  isOwner: boolean
  onItemRemoved: () => void
}

const CollectionAnimeGrid: FC<CollectionAnimeGridProps> = ({
  collectionId,
  items,
  isOwner,
  onItemRemoved,
}) => {
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [selectedAnimeId, setSelectedAnimeId] = useState<number | null>(null)

  const handleRemove = async (e: React.MouseEvent, animeId: number) => {
    e.stopPropagation()
    setRemovingId(animeId)
    try {
      await removeItemFromCollection(collectionId, animeId)
      toast.success('작품이 제거되었습니다.')
      onItemRemoved()
    } catch (err) {
      toast.error(extractApiError(err, '작품 제거에 실패했습니다.'))
    } finally {
      setRemovingId(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="collection-anime-grid-empty text-center py-16 text-subtle">
        <p className="text-lg font-medium">아직 추가된 작품이 없습니다</p>
        {isOwner && (
          <p className="text-sm mt-2">애니메이션을 검색해서 추가해보세요</p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="collection-anime-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.animeId}
            className="collection-anime-item group relative cursor-pointer"
            onClick={() => setSelectedAnimeId(item.animeId)}
          >
            <div className="collection-anime-thumbnail relative aspect-[2/3] rounded-lg overflow-hidden bg-content/10 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              {item.animeImg ? (
                <img
                  src={item.animeImg}
                  alt={item.animeName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-subtle text-xs">
                  이미지 없음
                </div>
              )}

              {isOwner && (
                <button
                  onClick={(e) => handleRemove(e, item.animeId)}
                  disabled={removingId === item.animeId}
                  className="collection-anime-remove-btn absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-white text-xs font-medium line-clamp-2 leading-tight">
                  {item.animeName}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAnimeId && (
        <AnimeDetailModal
          id={selectedAnimeId}
          onClose={() => setSelectedAnimeId(null)}
        />
      )}
    </>
  )
}

export default CollectionAnimeGrid
