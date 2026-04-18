import { FC, useCallback, useEffect, useRef, useState } from 'react'
import { getAnimeList } from '../../anime/api/animeApi'
import type { AnimeListItem } from '../../anime/types'

interface AnimeSearchInputProps {
  selectedAnime: AnimeListItem | null
  onSelect: (anime: AnimeListItem) => void
  onClear: () => void
  error?: string
  /** 미리 선택된 애니 이름이 있으면 정적 칩으로만 표시하고 검색 UI를 숨긴다 */
  preSelectedName?: string
}

const AnimeSearchInput: FC<AnimeSearchInputProps> = ({
  selectedAnime,
  onSelect,
  onClear,
  error,
  preSelectedName,
}) => {
  const [animeQuery, setAnimeQuery] = useState('')
  const [animeResults, setAnimeResults] = useState<AnimeListItem[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchAnime = useCallback(async (query: string) => {
    if (!query.trim()) {
      setAnimeResults([])
      return
    }
    try {
      const data = await getAnimeList({ q: query, size: 5 })
      setAnimeResults(data.content)
    } catch {
      setAnimeResults([])
    }
  }, [])

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => searchAnime(animeQuery), 300)
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [animeQuery, searchAnime])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (anime: AnimeListItem) => {
    setAnimeQuery('')
    setShowDropdown(false)
    onSelect(anime)
  }

  // 미리 선택된 애니 — 정적 칩만 표시
  if (preSelectedName) {
    return (
      <div className="selected-anime flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
        <span className="text-sm font-medium text-content flex-1 truncate">
          {preSelectedName}
        </span>
      </div>
    )
  }

  return (
    <div className="anime-selector" ref={dropdownRef}>
      {selectedAnime ? (
        <div className="selected-anime flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
          {selectedAnime.img && (
            <img
              src={selectedAnime.img}
              alt={selectedAnime.name}
              loading="lazy"
              className="w-8 h-10 rounded object-cover"
            />
          )}
          <span className="text-sm font-medium text-content flex-1 truncate">
            {selectedAnime.name}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-subtle hover:text-content text-sm px-1"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="anime-search relative">
          <input
            type="text"
            value={animeQuery}
            onChange={(e) => {
              setAnimeQuery(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder="애니메이션을 검색하세요..."
            className="anime-search-input w-full px-3 py-2 rounded-lg border border-content/10 bg-surface text-content text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder:text-subtle"
          />
          {showDropdown && animeResults.length > 0 && (
            <div className="anime-dropdown absolute z-20 top-full left-0 right-0 mt-1 bg-surface border border-content/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {animeResults.map((anime) => (
                <button
                  key={anime.id}
                  type="button"
                  onClick={() => handleSelect(anime)}
                  className="anime-option w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/5 transition-colors text-left"
                >
                  {anime.img && (
                    <img
                      src={anime.img}
                      alt={anime.name}
                      loading="lazy"
                      className="w-6 h-8 rounded object-cover shrink-0"
                    />
                  )}
                  <span className="text-sm text-content truncate">{anime.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  )
}

export default AnimeSearchInput
