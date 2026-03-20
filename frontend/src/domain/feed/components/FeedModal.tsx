import { FC, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useScrollLock } from '../../../global/hooks/useScrollLock'
import { getFeed } from '../api/feedApi'
import type { FeedResponse } from '../types'
import FeedCard from './FeedCard'

interface FeedModalProps {
  feedId: number
  onClose: () => void
}

const FeedModal: FC<FeedModalProps> = ({ feedId, onClose }) => {
  const [feed, setFeed] = useState<FeedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  useScrollLock(true)

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const data = await getFeed(feedId)
        setFeed(data)
      } catch {
        toast.error('피드를 불러오는데 실패했습니다.')
        onClose()
      } finally {
        setLoading(false)
      }
    }
    fetchFeed()
  }, [feedId, onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="feed-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="feed-modal relative z-10 bg-background rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto hover-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="feed-modal-close absolute top-3 right-3 z-20 text-subtle hover:text-content transition-colors text-xl"
        >
          ✕
        </button>
        <div className="feed-modal-body p-4 pt-10">
          {loading ? (
            <div className="feed-modal-loading space-y-3 animate-pulse">
              <div className="h-10 rounded bg-content/10" />
              <div className="h-24 rounded bg-content/10" />
            </div>
          ) : feed ? (
            <FeedCard feed={feed} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default FeedModal
