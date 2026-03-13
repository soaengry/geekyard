import { FC, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckItem } from './AnimeSidebar'

interface FilterExpandModalProps {
  title: string
  items: string[]
  selected: string[]
  onToggle: (item: string) => void
  onClose: () => void
}

const FilterExpandModal: FC<FilterExpandModalProps> = ({
  title,
  items,
  selected,
  onToggle,
  onClose,
}) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <div
      className="filter-expand-overlay fixed inset-0 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="filter-expand-modal relative z-10 bg-surface rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="filter-expand-header flex items-center justify-between p-5 border-b border-content/10 shrink-0">
          <h3 className="filter-expand-title text-base font-bold text-content">{title}</h3>
          <button
            onClick={onClose}
            className="close-btn w-8 h-8 rounded-full bg-content/10 text-content flex items-center justify-center hover:bg-content/20 transition-colors text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="filter-expand-list flex-1 overflow-y-auto p-5 space-y-0.5 custom-scrollbar">
          {items.map((item) => (
            <CheckItem
              key={item}
              label={item}
              checked={selected.includes(item)}
              onChange={() => onToggle(item)}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default FilterExpandModal
