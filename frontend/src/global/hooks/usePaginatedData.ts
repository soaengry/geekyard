import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { PageResponse } from '../../domain/anime/types'

/**
 * 페이지네이션 공통 훅.
 *
 * fetcher의 참조가 바뀌면(useCallback deps 변경) 자동으로 목록을 초기화하고 page 0부터 재조회한다.
 * loadMore를 호출하면 다음 페이지를 조회해 items에 append한다.
 *
 * @example
 * const fetcher = useCallback((page) => getAnimeList({ ...filters, page }), [filterKey])
 * const { items, loading, loadingMore, hasMore, loadMore } = usePaginatedData(fetcher)
 */
export function usePaginatedData<T>(fetcher: (page: number) => Promise<PageResponse<T>>): {
  items: T[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  total: number
  error: boolean
  loadMore: () => void
  setItems: Dispatch<SetStateAction<T[]>>
} {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState(false)

  // fetcher 최신 참조를 ref에 보관 — loadMore 클로저가 오래된 fetcher를 캡처하지 않도록
  const fetcherRef = useRef(fetcher)
  useEffect(() => {
    fetcherRef.current = fetcher
  })

  // fetcher identity 변경 시 초기화 후 page 0 조회
  useEffect(() => {
    let cancelled = false

    setItems([])
    setPage(0)
    setHasMore(false)
    setTotal(0)
    setError(false)
    setLoading(true)

    fetcher(0)
      .then((data) => {
        if (cancelled) return
        setItems(data.content)
        setTotal(data.totalElements)
        setHasMore(data.number < data.totalPages - 1)
      })
      .catch((err) => {
        if (cancelled || err?.name === 'CanceledError' || err?.name === 'AbortError') return
        setError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [fetcher])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return

    const nextPage = page + 1
    setLoadingMore(true)

    fetcherRef.current(nextPage)
      .then((data) => {
        setItems((prev) => [...prev, ...data.content])
        setTotal(data.totalElements)
        setHasMore(data.number < data.totalPages - 1)
        setPage(nextPage)
      })
      .catch((err) => {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return
      })
      .finally(() => setLoadingMore(false))
  }, [loadingMore, hasMore, page])

  return { items, loading, loadingMore, hasMore, total, error, loadMore, setItems }
}
