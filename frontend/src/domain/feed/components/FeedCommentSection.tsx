import { FC, useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuthStore } from '../../auth/store/useAuthStore'
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
} from '../api/feedApi'
import { extractApiError } from '../../../global/utils/extractApiError'
import type { CommentResponse } from '../types'
import CommentCard from './CommentCard'
import CommentForm from './CommentForm'

type CommentSort = 'LATEST' | 'POPULAR'

interface FeedCommentSectionProps {
  feedId: number
  onCommentCountChange: (delta: number) => void
  onCollapse?: () => void
}

const FeedCommentSection: FC<FeedCommentSectionProps> = ({
  feedId,
  onCommentCountChange,
  onCollapse,
}) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const currentUser = useAuthStore((s) => s.user)

  const [comments, setComments] = useState<CommentResponse[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sort, setSort] = useState<CommentSort>('LATEST')

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getComments(feedId, 0, 20, sort)
      setComments(data.content)
      setPage(0)
      setHasMore(data.number < data.totalPages - 1)
    } catch {
      toast.error('댓글을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [feedId, sort])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSortChange = (newSort: CommentSort) => {
    if (newSort !== sort) {
      setSort(newSort)
    }
  }

  const handleLoadMore = async () => {
    try {
      const nextPage = page + 1
      const data = await getComments(feedId, nextPage, 20, sort)
      setComments((prev) => [...prev, ...data.content])
      setPage(nextPage)
      setHasMore(data.number < data.totalPages - 1)
    } catch {
      toast.error('댓글을 불러오는데 실패했습니다.')
    }
  }

  const handleCreate = async (content: string) => {
    setSubmitting(true)
    try {
      const newComment = await createComment(feedId, content)
      setComments((prev) => [newComment, ...prev])
      onCommentCountChange(1)
      toast.success('댓글이 등록되었습니다.')
    } catch (err) {
      toast.error(extractApiError(err, '댓글 등록에 실패했습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (commentId: number, content: string) => {
    try {
      const updated = await updateComment(feedId, commentId, content)
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)))
      toast.success('댓글이 수정되었습니다.')
    } catch (err) {
      toast.error(extractApiError(err, '댓글 수정에 실패했습니다.'))
    }
  }

  const handleDelete = async (commentId: number) => {
    try {
      await deleteComment(feedId, commentId)
      setComments((prev) => prev.filter((c) => c.id !== commentId))
      onCommentCountChange(-1)
      toast.success('댓글이 삭제되었습니다.')
    } catch (err) {
      toast.error(extractApiError(err, '댓글 삭제에 실패했습니다.'))
    }
  }

  const handleToggleLike = async (commentId: number) => {
    try {
      const result = await toggleCommentLike(feedId, commentId)
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, liked: result.liked, likeCount: result.likeCount }
            : c,
        ),
      )
    } catch (err) {
      toast.error(extractApiError(err, '좋아요 처리에 실패했습니다.'))
    }
  }

  return (
    <div className="feed-comment-section border-t border-content/10 pt-3 mt-3">
      {isAuthenticated && (
        <CommentForm onSubmit={handleCreate} submitting={submitting} />
      )}

      <div className="comment-sort-tabs flex gap-2 mb-2">
        <button
          onClick={() => handleSortChange('LATEST')}
          className={`comment-sort-tab px-3 py-1 text-xs rounded-full transition-colors ${
            sort === 'LATEST'
              ? 'bg-primary text-white'
              : 'bg-content/10 text-subtle hover:text-content'
          }`}
        >
          최신순
        </button>
        <button
          onClick={() => handleSortChange('POPULAR')}
          className={`comment-sort-tab px-3 py-1 text-xs rounded-full transition-colors ${
            sort === 'POPULAR'
              ? 'bg-primary text-white'
              : 'bg-content/10 text-subtle hover:text-content'
          }`}
        >
          인기순
        </button>
      </div>

      {loading ? (
        <div className="comment-loading py-4 space-y-2 animate-pulse">
          <div className="h-8 rounded bg-content/10" />
          <div className="h-8 rounded bg-content/10" />
        </div>
      ) : (
        <>
          {comments.length > 0 ? (
            <div className="comment-list divide-y divide-content/5">
              {comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={comment}
                  isOwner={currentUser?.id === comment.userId}
                  isAuthenticated={isAuthenticated}
                  onEdit={(content) => handleEdit(comment.id, content)}
                  onDelete={() => handleDelete(comment.id)}
                  onToggleLike={() => handleToggleLike(comment.id)}
                />
              ))}
            </div>
          ) : (
            <p className="comment-empty text-center text-sm text-subtle py-4">
              아직 댓글이 없습니다.
            </p>
          )}

          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="comment-load-more w-full py-2 text-sm text-subtle hover:text-content transition-colors"
            >
              댓글 더보기
            </button>
          )}

          {onCollapse && (
            <button
              onClick={onCollapse}
              className="comment-collapse w-full py-2 text-sm text-subtle hover:text-content transition-colors border-t border-content/10 mt-2"
            >
              댓글 접기
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default FeedCommentSection
