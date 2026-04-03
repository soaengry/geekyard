import { FC, useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getCollectionDetail, updateCollection } from '../api/animeListApi'
import { extractApiError } from '../../../global/utils/extractApiError'
import CollectionHeader from '../components/CollectionHeader'
import CollectionAnimeGrid from '../components/CollectionAnimeGrid'
import EditCollectionModal from '../components/EditCollectionModal'
import type { AnimeListDetail } from '../types'

const CollectionDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()

  const [collection, setCollection] = useState<AnimeListDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const fetchDetail = useCallback(() => {
    if (!id) return
    setLoading(true)
    setError(false)
    getCollectionDetail(Number(id))
      .then(setCollection)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const handleEditSubmit = async (data: { title?: string; description?: string; isPublic?: boolean }) => {
    if (!id) return
    try {
      const updated = await updateCollection(Number(id), data)
      setCollection(updated)
      toast.success('컬렉션이 수정되었습니다.')
      setShowEditModal(false)
    } catch (err) {
      toast.error(extractApiError(err, '컬렉션 수정에 실패했습니다.'))
    }
  }

  if (loading) {
    return (
      <div className="collection-detail-page container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-content/10 rounded w-1/3" />
          <div className="h-4 bg-content/10 rounded w-2/3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-content/10" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className="collection-detail-page container mx-auto px-4 py-8">
        <div className="error-state text-center py-20 text-subtle">
          <p className="text-lg font-medium">컬렉션을 찾을 수 없습니다</p>
          <Link to="/collections" className="text-primary text-sm mt-2 inline-block hover:underline">
            컬렉션 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="collection-detail-page container mx-auto px-4 py-8">
      <Link
        to="/collections"
        className="collection-back-link inline-flex items-center gap-1 text-sm text-subtle hover:text-content transition-colors mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        컬렉션 목록
      </Link>

      <CollectionHeader
        collection={collection}
        onEditClick={() => setShowEditModal(true)}
      />

      <CollectionAnimeGrid
        collectionId={collection.id}
        items={collection.items}
        isOwner={collection.isOwner}
        onItemRemoved={fetchDetail}
      />

      {showEditModal && (
        <EditCollectionModal
          collection={collection}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  )
}

export default CollectionDetailPage
