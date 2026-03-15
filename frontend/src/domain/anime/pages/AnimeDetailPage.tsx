import { FC, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { getAnimeDetail } from '../api/animeApi'
import type { AnimeDetail } from '../types'
import ReviewTab from '../components/ReviewTab'
import FeedForm from '../../feed/components/FeedForm'
import FeedList from '../../feed/components/FeedList'
import AddToListModal from '../../animelist/components/AddToListModal'

const AnimeDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuthStore()
  const [anime, setAnime] = useState<AnimeDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [feedRefreshKey, setFeedRefreshKey] = useState(0)
  const [showAddToList, setShowAddToList] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(false)
    getAnimeDetail(Number(id))
      .then(setAnime)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 md:h-96 rounded-xl bg-content/10" />
          <div className="h-8 w-1/2 rounded bg-content/10" />
          <div className="h-4 w-1/4 rounded bg-content/10" />
          <div className="h-24 rounded bg-content/10" />
        </div>
      </div>
    )
  }

  if (error || !anime) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-subtle">
        <p className="text-4xl mb-4">😢</p>
        <p className="text-lg font-medium">애니메이션을 찾을 수 없습니다</p>
        <Link to="/anime" className="mt-4 inline-block text-primary hover:underline text-sm">
          목록으로 돌아가기
        </Link>
      </div>
    )
  }

  const heroImage = anime.images?.find((img) => img.optionName === 'home_default')?.imgUrl ?? anime.img
  const videoSrc = anime.highlightVideo?.hlsUrl ?? anime.highlightVideo?.dashUrl

  const ratingStars = (rating: number) => {
    const full = Math.floor(rating)
    const half = rating - full >= 0.5
    return Array.from({ length: 5 }, (_, i) => {
      if (i < full) return '★'
      if (i === full && half) return '½'
      return '☆'
    }).join('')
  }

  return (
    <div className="anime-detail-page container mx-auto px-4 py-8 max-w-4xl">
      <Link to="/anime" className="back-link text-subtle hover:text-primary text-sm transition-colors mb-6 inline-block">
        ← 목록으로
      </Link>

      {/* Hero */}
      <div className="hero-section relative rounded-xl overflow-hidden bg-black mb-8">
        {videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            className="w-full max-h-96 object-cover"
          />
        ) : (
          <img
            src={heroImage}
            alt={anime.name}
            className="w-full max-h-96 object-cover object-center"
          />
        )}
        <div className="hero-gradient absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="hero-info absolute bottom-0 left-0 p-6">
          <h1 className="hero-title text-white text-2xl md:text-3xl font-bold drop-shadow-lg">{anime.name}</h1>
          <div className="hero-meta flex items-center gap-3 mt-2">
            {anime.avgRating != null && (
              <p className="hero-rating text-yellow-400 text-lg drop-shadow">
                {ratingStars(anime.avgRating)} {anime.avgRating.toFixed(1)}
              </p>
            )}
            {isAuthenticated && (
              <button
                onClick={() => setShowAddToList(true)}
                className="add-to-list-btn text-xs font-medium px-3 py-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              >
                + 리스트 추가
              </button>
            )}
          </div>
        </div>
        {anime.isAdult && (
          <div className="adult-badge absolute top-4 left-4 bg-error text-white text-sm font-bold px-2 py-1 rounded">
            19+
          </div>
        )}
      </div>

      {/* Genres & Tags */}
      <div className="genre-tag-list flex flex-wrap gap-2 mb-6">
        {anime.genres?.map((g) => (
          <span key={g} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            {g}
          </span>
        ))}
        {anime.tags?.map((t) => (
          <span key={t} className="px-3 py-1 rounded-full bg-content/10 text-content text-sm">
            #{t}
          </span>
        ))}
      </div>

      {/* Info row */}
      <div className="info-row flex flex-wrap gap-4 text-sm text-subtle mb-6">
        {anime.medium && <span className="font-medium text-content">{anime.medium}</span>}
        {anime.airYearQuarter && <span>{anime.airYearQuarter}</span>}
      </div>

      {/* Description */}
      {anime.content && (
        <section className="description-section mb-8">
          <h2 className="section-title text-lg font-bold text-content mb-2">줄거리</h2>
          <p className="text-content/80 leading-relaxed whitespace-pre-line">{anime.content}</p>
        </section>
      )}

      {/* Cast */}
      {anime.casts && anime.casts.length > 0 && (
        <section className="cast-section mb-8">
          <h2 className="section-title text-lg font-bold text-content mb-3">등장인물</h2>
          <div className="cast-grid grid grid-cols-1 sm:grid-cols-2 gap-3">
            {anime.casts.map((cast, idx) => (
              <div key={idx} className="cast-item flex items-start gap-3 p-3 rounded-lg bg-surface border border-content/10">
                <div>
                  <p className="font-medium text-content text-sm">{cast.characterName}</p>
                  {cast.voiceActorNames && cast.voiceActorNames.length > 0 && (
                    <p className="text-subtle text-xs mt-0.5">{cast.voiceActorNames.join(', ')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Staff */}
      {((anime.directors && anime.directors.length > 0) ||
        (anime.productionCompanies && anime.productionCompanies.length > 0)) && (
        <section className="staff-section mb-8">
          <h2 className="section-title text-lg font-bold text-content mb-3">스태프</h2>
          <div className="staff-list space-y-2 text-sm">
            {anime.directors?.map((d, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-subtle w-20 shrink-0">{d.role}</span>
                <span className="text-content">{d.name}</span>
              </div>
            ))}
            {anime.productionCompanies && anime.productionCompanies.length > 0 && (
              <div className="flex gap-3">
                <span className="text-subtle w-20 shrink-0">제작사</span>
                <span className="text-content">
                  {anime.productionCompanies.map((c) => c.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="review-section mb-8">
        <h2 className="section-title text-lg font-bold text-content mb-3">리뷰</h2>
        <ReviewTab animeId={anime.id} />
      </section>

      {/* Feeds */}
      <section className="feed-section mb-8">
        <h2 className="section-title text-lg font-bold text-content mb-3">피드</h2>
        <div className="space-y-4">
          <FeedForm
            preSelectedAnimeId={anime.id}
            preSelectedAnimeName={anime.name}
            onCreated={() => setFeedRefreshKey((k) => k + 1)}
          />
          <FeedList animeId={anime.id} refreshKey={feedRefreshKey} />
        </div>
      </section>

      {showAddToList && anime && (
        <AddToListModal
          animeId={anime.id}
          animeName={anime.name}
          onClose={() => setShowAddToList(false)}
        />
      )}
    </div>
  )
}

export default AnimeDetailPage
