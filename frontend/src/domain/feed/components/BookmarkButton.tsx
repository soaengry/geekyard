import { FC } from 'react'

interface BookmarkButtonProps {
  bookmarked: boolean
  onToggle: () => void
  disabled?: boolean
}

const BookmarkButton: FC<BookmarkButtonProps> = ({ bookmarked, onToggle, disabled }) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`bookmark-button flex items-center gap-1 text-sm transition-colors ${
        bookmarked ? 'text-secondary' : 'text-subtle hover:text-secondary'
      } disabled:opacity-50`}
    >
      <svg
        className="bookmark-icon w-4 h-4"
        fill={bookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  )
}

export default BookmarkButton
