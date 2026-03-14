import { FC, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { isAxiosError } from 'axios'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { toggleFeedLike, toggleFeedBookmark, deleteFeed } from '../api/feedApi'
import type { FeedResponse } from '../types'
import LikeButton from './LikeButton'
import BookmarkButton from './BookmarkButton'
import FeedCommentSection from './FeedCommentSection'

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

  const isOwner = currentUser?.id === feed.userId
  const images = feed.imageUrls ?? []

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info('로그인이 필요합니다.')
      return
    }
    try {
      const result = await toggleFeedLike(feed.id)
      setLiked(result.liked)
      setLikeCount(result.likeCount)
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error('좋아요 처리에 실패했습니다.')
      }
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
    } catch (err) {
      if (isAxiosError(err)) {
        toast.error('북마크 처리에 실패했습니다.')
      }
    }
  }

  const handleDelete = async () => {
    try {
      await deleteFeed(feed.id)
      toast.success('피드가 삭제되었습니다.')
      onDelete?.()
    } catch (err) {
      if (isAxiosError(err)) {
        const msg = (err.response?.data as { status?: { message?: string } })?.status
          ?.message
        toast.error(msg ?? '피드 삭제에 실패했습니다.')
      }
    }
  }

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goLightbox = useCallback(
    (dir: 1 | -1) => {
      if (lightboxIndex === null) return
      setLightboxIndex((lightboxIndex + dir + images.length) % images.length)
    },
    [lightboxIndex, images.length],
  )

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') goLightbox(-1)
      else if (e.key === 'ArrowRight') goLightbox(1)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handler)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handler)
    }
  }, [lightboxIndex, goLightbox])

  const imageGridClass =
    images.length === 1
      ? 'grid-cols-1'
      : images.length === 2
        ? 'grid-cols-2'
        : images.length === 3
          ? 'grid-cols-2'
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
            <Link
              to={`/anime/${feed.animeId}`}
              className="feed-anime-link hover:text-primary transition-colors truncate"
            >
              {feed.animeName}
            </Link>
            <span>·</span>
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
              onClick={() => openLightbox(idx)}
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
              onClick={() => {
                handleDelete()
                setShowConfirm(false)
              }}
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
        />
      )}

      {/* Lightbox modal */}
      {lightboxIndex !== null && (
        <div
          className="feed-lightbox fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="lightbox-close absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-lg"
          >
            ✕
          </button>

          {/* Previous */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goLightbox(-1)
              }}
              className="lightbox-prev absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-lg"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <img
            src={images[lightboxIndex]}
            alt={`피드 이미지 ${lightboxIndex + 1}`}
            className="lightbox-image max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goLightbox(1)
              }}
              className="lightbox-next absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-lg"
            >
              ›
            </button>
          )}

          {/* Indicator */}
          {images.length > 1 && (
            <div className="lightbox-indicator absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex(idx)
                  }}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === lightboxIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FeedCard
