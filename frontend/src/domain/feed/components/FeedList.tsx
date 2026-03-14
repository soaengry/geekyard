import { FC, useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getFeeds } from '../api/feedApi'
import type { FeedResponse } from '../types'
import FeedCard from './FeedCard'

interface FeedListProps {
  animeId?: number
  refreshKey?: number
}

const FeedList: FC<FeedListProps> = ({ animeId, refreshKey }) => {
  const [feeds, setFeeds] = useState<FeedResponse[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFeeds = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFeeds(0, 10, animeId)
      setFeeds(data.content)
      setPage(0)
      setHasMore(data.number < data.totalPages - 1)
    } catch {
      toast.error('피드를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [animeId])

  useEffect(() => {
    fetchFeeds()
  }, [fetchFeeds, refreshKey])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const data = await getFeeds(nextPage, 10, animeId)
      setFeeds((prev) => [...prev, ...data.content])
      setPage(nextPage)
      setHasMore(data.number < data.totalPages - 1)
    } catch {
      toast.error('피드를 불러오는데 실패했습니다.')
    } finally {
      setLoadingMore(false)
    }
  }

  const handleDelete = (feedId: number) => {
    setFeeds((prev) => prev.filter((f) => f.id !== feedId))
  }

  if (loading) {
    return (
      <div className="feed-list-loading space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl bg-content/10" />
        ))}
      </div>
    )
  }

  if (feeds.length === 0) {
    return (
      <div className="feed-empty text-center py-12">
        <p className="text-subtle text-sm">아직 피드가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="feed-list space-y-4">
      {feeds.map((feed) => (
        <FeedCard key={feed.id} feed={feed} onDelete={() => handleDelete(feed.id)} />
      ))}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className="feed-load-more w-full py-2.5 text-sm rounded-lg bg-content/5 text-subtle hover:text-content hover:bg-content/10 transition-colors disabled:opacity-50"
        >
          {loadingMore ? '불러오는 중...' : '더보기'}
        </button>
      )}
    </div>
  )
}

export default FeedList
