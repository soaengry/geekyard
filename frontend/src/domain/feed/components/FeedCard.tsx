import { FC, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { toggleFeedLike, toggleFeedBookmark, deleteFeed } from '../api/feedApi'
import { formatDate } from '../../../global/utils/formatDate'
import { extractApiError } from '../../../global/utils/extractApiError'
import type { FeedResponse } from '../types'
import LikeButton from './LikeButton'
import BookmarkButton from './BookmarkButton'
import FeedCommentSection from './FeedCommentSection'
import ImageLightbox from './ImageLightbox'
import AnimeDetailModal from '../../anime/components/AnimeDetailModal'

interface FeedCardProps {
  feed: FeedResponse
  onDelete?: () => void
  onUpdate?: () => void
}

const FeedCard: FC<FeedCardProps> = ({ feed, onDelete, onUpdate }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const currentUser = useAuthStore((s) => s.user)

  const [liked, setLiked] = useState(feed.liked)
  const [likeCount, setLikeCount] = useState(feed.likeCount)
  const [bookmarked, setBookmarked] = useState(feed.bookmarked)
  const [commentCount, setCommentCount] = useState(feed.commentCount)
  const [showComments, setShowComments] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [animeModalId, setAnimeModalId] = useState<number | null>(null)

  useEffect(() => {
    setLiked(feed.liked)
    setLikeCount(feed.likeCount)
    setBookmarked(feed.bookmarked)
    setCommentCount(feed.commentCount)
  }, [feed.liked, feed.likeCount, feed.bookmarked, feed.commentCount])

  const isOwner = currentUser?.id === feed.userId
  const images = feed.imageUrls ?? []

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info('로그인이 필요합니다.')
      return
    }
    try {
      const result = await toggleFeedLike(feed.id)
      setLiked(result.liked)
      setLikeCount(result.likeCount)
    } catch {
      toast.error('좋아요 처리에 실패했습니다.')
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.info('로그인이 필요합니다.')
      return
    }
    try {
      const result = await toggleFeedBookmark(feed.id)
      setBookmarked(result.bookmarked)
    } catch {
      toast.error('북마크 처리에 실패했습니다.')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteFeed(feed.id)
      toast.success('피드가 삭제되었습니다.')
      setShowConfirm(false)
      onDelete?.()
    } catch (err) {
      toast.error(extractApiError(err, '피드 삭제에 실패했습니다.'))
    }
  }

  const imageGridClass =
    images.length === 1
      ? 'grid-cols-1'
      : 'grid-cols-2'

  return (
    <div className="feed-card bg-surface rounded-xl border border-content/10 p-4 shadow-sm">
      {/* Header: User + Anime info */}
      <div className="feed-header flex items-center gap-3 mb-3">
        <div className="feed-avatar w-9 h-9 rounded-full bg-content/10 overflow-hidden shrink-0">
          {feed.profileImage ? (
            <img
              src={feed.profileImage}
              alt={feed.nickname}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-subtle text-sm">
              {feed.nickname.charAt(0)}
            </div>
          )}
        </div>
        <div className="feed-meta flex-1 min-w-0">
          <p className="feed-nickname text-sm font-medium text-content truncate">
            {feed.nickname}
          </p>
          <div className="feed-info flex items-center gap-1.5 text-xs text-subtle">
            {feed.animeId && feed.animeName && (
              <>
                <button
                  onClick={() => setAnimeModalId(feed.animeId)}
                  className="feed-anime-link hover:text-primary transition-colors truncate"
                >
                  {feed.animeName}
                </button>
                <span>·</span>
              </>
            )}
            <span className="feed-date">{formatDate(feed.createdAt)}</span>
          </div>
        </div>
        {isOwner && (
          <div className="feed-owner-actions flex gap-1 shrink-0">
            {onUpdate && (
              <button
                onClick={onUpdate}
                className="feed-edit-btn text-xs text-subtle hover:text-primary transition-colors px-2 py-1"
              >
                수정
              </button>
            )}
            <button
              onClick={() => setShowConfirm(true)}
              className="feed-delete-btn text-xs text-subtle hover:text-error transition-colors px-2 py-1"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <p className="feed-content text-sm text-content/90 leading-relaxed whitespace-pre-line mb-3">
        {feed.content}
      </p>

      {/* Images */}
      {images.length > 0 && (
        <div className={`feed-images grid ${imageGridClass} gap-1 mb-3 rounded-lg overflow-hidden`}>
          {images.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setLightboxIndex(idx)}
              className={`feed-image-thumb relative overflow-hidden ${
                images.length === 3 && idx === 0 ? 'row-span-2' : ''
              }`}
            >
              <img
                src={url}
                alt={`피드 이미지 ${idx + 1}`}
                className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-200"
              />
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="feed-actions flex items-center gap-4">
        <LikeButton liked={liked} count={likeCount} onToggle={handleLike} />
        <button
          onClick={() => setShowComments(!showComments)}
          className="comment-toggle flex items-center gap-1.5 text-sm text-subtle hover:text-content transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{commentCount}</span>
        </button>
        <BookmarkButton bookmarked={bookmarked} onToggle={handleBookmark} />
      </div>

      {/* Delete confirmation */}
      {showConfirm && (
        <div className="feed-delete-confirm mt-3 p-3 rounded-lg bg-error/5 border border-error/20">
          <p className="text-sm text-content mb-2">피드를 삭제하시겠습니까?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-xs rounded-lg bg-error text-white hover:bg-error/90 transition-colors"
            >
              삭제
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 text-xs rounded-lg bg-content/10 text-content hover:bg-content/20 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <FeedCommentSection
          feedId={feed.id}
          onCommentCountChange={(delta) => setCommentCount((prev) => prev + delta)}
          onCollapse={() => setShowComments(false)}
        />
      )}

      {/* Lightbox modal */}
      {lightboxIndex !== null && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      {/* Anime detail modal */}
      {animeModalId !== null && (
        <AnimeDetailModal
          id={animeModalId}
          onClose={() => setAnimeModalId(null)}
        />
      )}
    </div>
  )
}

export default FeedCard
