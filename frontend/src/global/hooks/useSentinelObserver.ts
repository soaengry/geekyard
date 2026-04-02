import { RefObject, useEffect } from 'react'

interface UseSentinelObserverOptions {
  sentinelRef: RefObject<HTMLDivElement | null>
  hasMore: boolean
  loading: boolean
  onLoadMore: () => void
  threshold?: number
}

/**
 * IntersectionObserver 기반 무한 스크롤 트리거 훅.
 *
 * sentinel 요소가 뷰포트에 진입하면 onLoadMore를 호출한다.
 * hasMore가 false이거나 loading 중이면 옵저버를 연결하지 않는다.
 *
 * @example
 * const sentinelRef = useRef<HTMLDivElement>(null)
 * useSentinelObserver({ sentinelRef, hasMore, loading: loadingMore || initialLoading, onLoadMore: () => setPage(p => p + 1) })
 * // JSX: <div ref={sentinelRef} />
 */
export const useSentinelObserver = ({
  sentinelRef,
  hasMore,
  loading,
  onLoadMore,
  threshold = 0.1,
}: UseSentinelObserverOptions): void => {
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore()
      },
      { threshold },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinelRef, hasMore, loading, onLoadMore, threshold])
}
