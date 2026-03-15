import { FC } from 'react'
import type { AnimeSortType } from '../types'

interface AnimeSortSelectorProps {
  value: AnimeSortType
  onChange: (sort: AnimeSortType) => void
}

const SORT_OPTIONS: { value: AnimeSortType; label: string }[] = [
  { value: 'popular', label: '인기순' },
  { value: 'latest', label: '업데이트순' },
  { value: 'reviewCount', label: '리뷰 많은순' },
  { value: 'rating', label: '별점 높은순' },
]

const AnimeSortSelector: FC<AnimeSortSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="anime-sort-selector flex gap-2 overflow-x-auto scrollbar-hide">
      {SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          className={`sort-pill shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === option.value
              ? 'bg-primary text-white'
              : 'bg-surface border border-content/20 text-content hover:border-primary hover:text-primary'
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default AnimeSortSelector
