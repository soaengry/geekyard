import { FC, useState } from 'react'
import type { CommentResponse } from '../types'

interface CommentCardProps {
  comment: CommentResponse
  isOwner: boolean
  onEdit: (content: string) => void
  onDelete: () => void
}

const CommentCard: FC<CommentCardProps> = ({ comment, isOwner, onEdit, onDelete }) => {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSave = () => {
    if (editContent.trim()) {
      onEdit(editContent.trim())
      setEditing(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="comment-card flex gap-2.5 py-3">
      <div className="comment-avatar w-7 h-7 rounded-full bg-content/10 overflow-hidden shrink-0">
        {comment.profileImage ? (
          <img
            src={comment.profileImage}
            alt={comment.nickname}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-subtle text-xs">
            {comment.nickname.charAt(0)}
          </div>
        )}
      </div>
      <div className="comment-body flex-1 min-w-0">
        <div className="comment-meta flex items-center gap-2">
          <span className="comment-nickname text-sm font-medium text-content">
            {comment.nickname}
          </span>
          <span className="comment-date text-xs text-subtle">{formatDate(comment.createdAt)}</span>
        </div>
        {editing ? (
          <div className="comment-edit mt-1.5 space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="comment-edit-input w-full px-2.5 py-1.5 rounded-lg border border-content/10 bg-surface text-content text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={2}
            />
            <div className="comment-edit-actions flex gap-1.5">
              <button
                onClick={handleSave}
                className="comment-save-btn px-3 py-1 text-xs rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                저장
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setEditContent(comment.content)
                }}
                className="comment-cancel-btn px-3 py-1 text-xs rounded-lg bg-content/10 text-content hover:bg-content/20 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="comment-content text-sm text-content/80 mt-0.5 whitespace-pre-line">
              {comment.content}
            </p>
            {isOwner && (
              <div className="comment-actions flex gap-2 mt-1">
                <button
                  onClick={() => setEditing(true)}
                  className="comment-edit-trigger text-xs text-subtle hover:text-primary transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => setShowConfirm(true)}
                  className="comment-delete-trigger text-xs text-subtle hover:text-error transition-colors"
                >
                  삭제
                </button>
              </div>
            )}
          </>
        )}
        {showConfirm && (
          <div className="comment-delete-confirm mt-2 flex gap-2 items-center">
            <span className="text-xs text-content">삭제하시겠습니까?</span>
            <button
              onClick={() => {
                onDelete()
                setShowConfirm(false)
              }}
              className="px-2 py-0.5 text-xs rounded bg-error text-white hover:bg-error/90 transition-colors"
            >
              삭제
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-2 py-0.5 text-xs rounded bg-content/10 text-content hover:bg-content/20 transition-colors"
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentCard
