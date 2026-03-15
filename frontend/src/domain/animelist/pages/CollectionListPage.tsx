import { FC, useEffect, useRef, useState } from 'react'
import { getCollections } from '../api/animeListApi'
import { useAuthStore } from '../../auth/store/useAuthStore'
import CollectionCard from '../components/CollectionCard'
import CreateCollectionModal from '../components/CreateCollectionModal'
import type { AnimeListSummary } from '../types'

const CollectionListPage: FC = () => {
  const { isAuthenticated } = useAuthStore()

  const [items, setItems] = useState<AnimeListSummary[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [fetchError, setFetchError] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetchInitial = () => {
    setItems([])
    setPage(0)
    setHasMore(true)
    setInitialLoading(true)
    setFetchError(false)

    getCollections(0, 12)
      .then((data) => {
        setItems(data.content)
        setHasMore(data.number < data.totalPages - 1)
      })
      .catch(() => setFetchError(true))
      .finally(() => setInitialLoading(false))
  }

  useEffect(() => {
    fetchInitial()
  }, [])

  useEffect(() => {
    if (page === 0) return
    setLoadingMore(true)
    getCollections(page, 12)
      .then((data) => {
        setItems((prev) => [...prev, ...data.content])
        setHasMore(data.number < data.totalPages - 1)
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false))
  }, [page])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || loadingMore || initialLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, initialLoading])

  return (
    <div className="collection-list-page container mx-auto px-4 py-8">
      <div className="page-header flex items-center justify-between mb-6">
        <h1 className="page-title text-2xl font-bold text-content">컬렉션</h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="create-collection-btn px-4 py-2 text-sm rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            컬렉션 만들기
          </button>
        )}
      </div>

      {initialLoading ? (
        <div className="skeleton-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-content/10 animate-pulse">
              <div className="aspect-[4/3]" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-content/10 rounded w-3/4" />
                <div className="h-3 bg-content/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <div className="error-state text-center py-20 text-subtle">
          <p className="text-lg font-medium">데이터를 불러오지 못했습니다</p>
          <p className="text-sm mt-2">서버 연결을 확인해주세요</p>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="collection-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((collection) => (
              <CollectionCard key={collection.id} collection={collection} />
            ))}
          </div>

          <div ref={sentinelRef} className="scroll-sentinel h-4 mt-4" />

          {loadingMore && (
            <div className="loading-more-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-content/10 animate-pulse">
                  <div className="aspect-[4/3]" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-content/10 rounded w-3/4" />
                    <div className="h-3 bg-content/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!hasMore && (
            <p className="end-message text-center text-subtle text-sm py-8">
              모든 컬렉션을 불러왔습니다 ({items.length}개)
            </p>
          )}
        </>
      ) : (
        <div className="empty-state text-center py-20 text-subtle">
          <p className="text-lg font-medium">아직 컬렉션이 없습니다</p>
          {isAuthenticated && (
            <p className="text-sm mt-2">첫 번째 컬렉션을 만들어보세요!</p>
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchInitial}
        />
      )}
    </div>
  )
}

export default CollectionListPage
