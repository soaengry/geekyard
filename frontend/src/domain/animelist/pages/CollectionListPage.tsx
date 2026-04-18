import { FC, useCallback, useRef, useState } from 'react'
import { usePaginatedData } from '../../../global/hooks/usePaginatedData'
import { useSentinelObserver } from '../../../global/hooks/useSentinelObserver'
import { getCollections } from '../api/animeListApi'
import { useAuthStore } from '../../auth/store/useAuthStore'
import CollectionCard from '../components/CollectionCard'
import CreateCollectionModal from '../components/CreateCollectionModal'
import type { AnimeListSummary } from '../types'

const CollectionListPage: FC = () => {
  const { isAuthenticated } = useAuthStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  // 컬렉션 생성 후 목록 재조회를 위한 키
  const [refreshKey, setRefreshKey] = useState(0)

  const sentinelRef = useRef<HTMLDivElement>(null)

  const fetcher = useCallback(
    (page: number) => getCollections(page, 12),
    [refreshKey], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const { items, loading: initialLoading, loadingMore, hasMore, error: fetchError, loadMore } =
    usePaginatedData<AnimeListSummary>(fetcher)

  useSentinelObserver({
    sentinelRef,
    hasMore,
    loading: loadingMore || initialLoading,
    onLoadMore: loadMore,
  })

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
          onCreated={() => {
            setShowCreateModal(false)
            setRefreshKey((k) => k + 1)
          }}
        />
      )}
    </div>
  )
}

export default CollectionListPage
