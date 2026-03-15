import { FC, memo } from 'react'

interface LikeButtonProps {
  liked: boolean
  count: number
  onToggle: () => void
  disabled?: boolean
}

const LikeButton: FC<LikeButtonProps> = ({ liked, count, onToggle, disabled }) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`like-button flex items-center gap-1.5 text-sm transition-colors ${
        liked ? 'text-error' : 'text-subtle hover:text-error'
      } disabled:opacity-50`}
    >
      <span className="like-icon text-base">{liked ? '♥' : '♡'}</span>
      <span className="like-count">{count}</span>
    </button>
  )
}

export default memo(LikeButton)
