import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAnimeFilter, saveGenrePreferences } from '../api/animeApi'

const MAX_GENRES = 5

const GenreSelectionPage: FC = () => {
  const navigate = useNavigate()
  const [genres, setGenres] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getAnimeFilter()
      .then((filter) => setGenres(filter.genres))
      .catch(() => toast.error('장르 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  const toggleGenre = (genre: string) => {
    setSelected((prev) => {
      if (prev.includes(genre)) return prev.filter((g) => g !== genre)
      if (prev.length >= MAX_GENRES) {
        toast.warn(`최대 ${MAX_GENRES}개까지 선택할 수 있습니다.`)
        return prev
      }
      return [...prev, genre]
    })
  }

  const handleSave = async () => {
    if (selected.length === 0) {
      toast.warn('최소 1개의 장르를 선택해주세요.')
      return
    }
    setSaving(true)
    try {
      await saveGenrePreferences(selected)
      toast.success('장르 선호도가 저장되었습니다.')
      navigate('/')
    } catch {
      toast.error('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="genre-selection-page max-w-2xl mx-auto py-12 text-center text-subtle">
        장르 목록을 불러오는 중...
      </div>
    )
  }

  return (
    <div className="genre-selection-page max-w-2xl mx-auto py-8 px-4">
      <h1 className="genre-selection-title text-2xl font-bold text-content mb-2">
        좋아하는 장르를 선택하세요
      </h1>
      <p className="genre-selection-subtitle text-subtle text-sm mb-6">
        선택한 장르를 기반으로 맞춤 추천을 해드립니다. (최대 {MAX_GENRES}개)
      </p>

      <div className="genre-grid grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8">
        {genres.map((genre) => {
          const isSelected = selected.includes(genre)
          return (
            <button
              key={genre}
              onClick={() => toggleGenre(genre)}
              className={`genre-chip px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border ${
                isSelected
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-content border-content/15 hover:border-primary/50'
              }`}
            >
              {genre}
            </button>
          )
        })}
      </div>

      <div className="genre-selection-actions flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || selected.length === 0}
          className="genre-save-btn flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? '저장 중...' : `저장 (${selected.length}/${MAX_GENRES})`}
        </button>
        <button
          onClick={() => navigate('/')}
          className="genre-skip-btn px-6 py-3 rounded-lg text-subtle border border-content/15 hover:bg-content/5 transition-colors"
        >
          건너뛰기
        </button>
      </div>
    </div>
  )
}

export default GenreSelectionPage
