import { FC, useCallback } from 'react'
import { usePaginatedData } from '../../../global/hooks/usePaginatedData'
import { getFeeds } from '../api/feedApi'
import type { FeedResponse } from '../types'
import FeedCard from './FeedCard'

interface FeedListProps {
  animeId?: number
  refreshKey?: number
}

const FeedList: FC<FeedListProps> = ({ animeId, refreshKey }) => {
  const fetcher = useCallback(
    (page: number) => getFeeds(page, 10, animeId),
    [animeId, refreshKey], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const { items: feeds, loading, loadingMore, hasMore, loadMore, setItems: setFeeds } =
    usePaginatedData<FeedResponse>(fetcher)

  const handleDelete = useCallback(
    (feedId: number) => setFeeds((prev) => prev.filter((f) => f.id !== feedId)),
    [setFeeds],
  )

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
          onClick={loadMore}
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
