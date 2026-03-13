import { FC, useState } from 'react'
import FilterExpandModal from './FilterExpandModal'

interface AnimeSidebarProps {
  availableGenres: string[]
  availableTags: string[]
  availableYears: string[]
  selectedGenres: string[]
  selectedTags: string[]
  selectedYears: string[]
  onGenreToggle: (genre: string) => void
  onTagToggle: (tag: string) => void
  onYearToggle: (year: string) => void
  onClear: () => void
}

export const CheckItem: FC<{
  label: string
  checked: boolean
  onChange: () => void
}> = ({ label, checked, onChange }) => (
  <label className="check-item flex items-center gap-2.5 cursor-pointer py-0.5 group">
    <div
      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked
          ? 'bg-primary border-primary'
          : 'border-content/30 group-hover:border-primary/60'
      }`}
    >
      {checked && (
        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
          <path
            d="M1 4l3 3 5-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    <span
      className={`text-sm transition-colors ${
        checked ? 'text-primary font-medium' : 'text-content group-hover:text-primary'
      }`}
    >
      {label}
    </span>
  </label>
)

const SidebarSection: FC<{
  title: string
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
  limit: number
}> = ({ title, items, selected, onToggle, limit }) => {
  const [expandModalOpen, setExpandModalOpen] = useState(false)

  if (items.length === 0) return null

  const visibleItems = items.slice(0, limit)
  const hasMore = items.length > limit

  return (
    <div>
      <h3 className="sidebar-section-title text-xs font-bold text-subtle uppercase tracking-wider mb-3">{title}</h3>
      <div className="sidebar-section-items space-y-0.5">
        {visibleItems.map((item) => (
          <CheckItem
            key={item}
            label={item}
            checked={selected.includes(item)}
            onChange={() => onToggle(item)}
          />
        ))}
      </div>
      {hasMore && (
        <button
          onClick={() => setExpandModalOpen(true)}
          className="show-more-btn mt-2 text-xs text-primary hover:underline"
        >
          더보기
        </button>
      )}
      {expandModalOpen && (
        <FilterExpandModal
          title={title}
          items={items}
          selected={selected}
          onToggle={onToggle}
          onClose={() => setExpandModalOpen(false)}
        />
      )}
    </div>
  )
}

const AnimeSidebar: FC<AnimeSidebarProps> = ({
  availableGenres,
  availableTags,
  availableYears,
  selectedGenres,
  selectedTags,
  selectedYears,
  onGenreToggle,
  onTagToggle,
  onYearToggle,
  onClear,
}) => {
  const hasFilters = selectedGenres.length > 0 || selectedTags.length > 0 || selectedYears.length > 0

  return (
    <div className="anime-sidebar space-y-6">
      <div className="sidebar-header flex items-center justify-between">
        <h2 className="sidebar-title text-sm font-bold text-content">필터</h2>
        {hasFilters && (
          <button onClick={onClear} className="text-xs text-primary hover:underline">
            초기화
          </button>
        )}
      </div>

      <SidebarSection
        title="장르"
        items={availableGenres}
        selected={selectedGenres}
        onToggle={onGenreToggle}
        limit={10}
      />

      <SidebarSection
        title="태그"
        items={availableTags}
        selected={selectedTags}
        onToggle={onTagToggle}
        limit={10}
      />

      <SidebarSection
        title="방영 연도"
        items={availableYears}
        selected={selectedYears}
        onToggle={onYearToggle}
        limit={4}
      />
    </div>
  )
}

export default AnimeSidebar
