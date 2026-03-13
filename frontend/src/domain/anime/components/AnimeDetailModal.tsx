import { FC, useEffect, useMemo, useState } from "react";
import { getAnimeDetail } from "../api/animeApi";
import type { AnimeDetail } from "../types";

interface AnimeDetailModalProps {
  id: number;
  onClose: () => void;
}

const TABS = ["정보", "리뷰", "피드", "톡톡"] as const;
type Tab = (typeof TABS)[number];

const AnimeDetailModal: FC<AnimeDetailModalProps> = ({ id, onClose }) => {
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("정보");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    setAnime(null);
    getAnimeDetail(id)
      .then(setAnime)
      .catch(() => setAnime(null))
      .finally(() => setLoading(false));
  }, [id]);

  const customImage = useMemo(
    () => anime?.images?.find((img) => img.optionName === "home_custom"),
    [anime],
  );
  const defaultImage = useMemo(
    () => anime?.images?.find((img) => img.optionName === "home_default"),
    [anime],
  );
  const heroBannerUrl = customImage?.imgUrl ?? anime?.img;
  const posterUrl = defaultImage?.imgUrl ?? anime?.img;

  return (
    <div
      className="anime-detail-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="anime-detail-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="anime-detail-modal relative z-10 bg-surface rounded-2xl w-full max-w-2xl h-[95vh] overflow-y-auto md:overflow-hidden md:flex md:flex-col custom-scrollbar shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="close-btn absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors text-sm font-bold"
        >
          ✕
        </button>

        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            <div className="h-52 rounded-t-2xl bg-content/10" />
            <div className="h-6 w-2/3 rounded bg-content/10 mx-5" />
            <div className="h-4 w-1/2 rounded bg-content/10 mx-5" />
            <div className="h-20 rounded bg-content/10 mx-5 mb-5" />
          </div>
        ) : anime ? (
          <>
            {/* Desktop: Hero fixed + body scrolls separately */}
            {/* Mobile: everything scrolls together */}

            {/* Hero — desktop: shrink-0 (fixed), mobile: inside scroll */}
            <div className="hero-section relative max-h-80 overflow-hidden rounded-t-2xl bg-black shrink-0 md:shrink-0">
              {anime.highlightVideo ? (
                <video
                  src={anime.highlightVideo.hlsUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="hero-video w-full h-full object-cover"
                />
              ) : heroBannerUrl ? (
                <img
                  src={heroBannerUrl}
                  alt={anime.name}
                  className="hero-banner w-full h-full object-cover"
                />
              ) : null}
              <div className="hero-gradient absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {anime.isAdult && (
                <div className="adult-badge absolute top-3 left-3 bg-error text-white text-xs font-bold px-2 py-1 rounded">
                  19+
                </div>
              )}

              {posterUrl && (
                <div className="hero-poster absolute right-5 bottom-4 w-24 aspect-[2/3] rounded-lg overflow-hidden shadow-lg border-2 border-white/20">
                  <img
                    src={posterUrl}
                    alt={anime.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="hero-info absolute bottom-0 left-0 p-5 pr-32">
                <h2 className="hero-title text-white text-xl font-bold drop-shadow">
                  {anime.name}
                </h2>
                {anime.avgRating != null && (
                  <p className="hero-rating text-yellow-400 text-sm mt-1">
                    ★ {anime.avgRating.toFixed(1)}
                  </p>
                )}
              </div>
            </div>

            {/* Scrollable body — desktop: flex-1 scroll, mobile: handled by parent */}
            <div className="detail-body md:flex-1 md:min-h-0 md:overflow-y-auto custom-scrollbar">
              {/* Tab bar — sticky */}
              <div className="tab-bar sticky top-0 z-10 bg-surface border-b border-content/10">
                <div className="tab-list flex">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`tab-item flex-1 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === tab
                          ? "text-primary"
                          : "text-subtle hover:text-content"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="tab-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              {activeTab === "정보" ? (
                <div className="tab-info p-5 space-y-5">
                  <div className="genre-tag-list flex flex-wrap gap-2">
                    {anime.genres?.map((g) => (
                      <span
                        key={g}
                        className="genre-badge px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                      >
                        {g}
                      </span>
                    ))}
                    {anime.tags?.map((t) => (
                      <span
                        key={t}
                        className="tag-badge px-3 py-1 rounded-full bg-content/10 text-content text-xs"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="info-row flex flex-wrap gap-3 text-sm text-subtle">
                    {anime.medium && (
                      <span className="info-medium font-medium text-content">
                        {anime.medium}
                      </span>
                    )}
                    {anime.airYearQuarter && (
                      <span className="info-air-date">
                        {anime.airYearQuarter}
                      </span>
                    )}
                  </div>

                  {anime.content && (
                    <div className="description-section">
                      <h3 className="section-title text-sm font-bold text-content mb-2">
                        줄거리
                      </h3>
                      <p className="description-text text-content/80 text-sm leading-relaxed whitespace-pre-line">
                        {anime.content}
                      </p>
                    </div>
                  )}

                  {anime.casts && anime.casts.length > 0 && (
                    <div className="cast-section">
                      <h3 className="section-title text-sm font-bold text-content mb-2">
                        등장인물
                      </h3>
                      <div className="cast-grid grid grid-cols-2 gap-2">
                        {anime.casts.slice(0, 6).map((cast, idx) => (
                          <div
                            key={idx}
                            className="cast-item p-2.5 rounded-lg bg-background border border-content/10"
                          >
                            <p className="cast-character text-sm font-medium text-content">
                              {cast.characterName}
                            </p>
                            {cast.voiceActorNames &&
                              cast.voiceActorNames.length > 0 && (
                                <p className="cast-actor text-xs text-subtle mt-0.5">
                                  {cast.voiceActorNames.join(", ")}
                                </p>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {((anime.directors && anime.directors.length > 0) ||
                    (anime.productionCompanies &&
                      anime.productionCompanies.length > 0)) && (
                    <div className="staff-section">
                      <h3 className="section-title text-sm font-bold text-content mb-2">
                        스태프
                      </h3>
                      <div className="staff-list space-y-1.5 text-sm">
                        {anime.directors?.map((d, idx) => (
                          <div key={idx} className="staff-item flex gap-3">
                            <span className="staff-role text-subtle w-16 shrink-0">
                              {d.role}
                            </span>
                            <span className="staff-name text-content">
                              {d.name}
                            </span>
                          </div>
                        ))}
                        {anime.productionCompanies &&
                          anime.productionCompanies.length > 0 && (
                            <div className="staff-item flex gap-3">
                              <span className="staff-role text-subtle w-16 shrink-0">
                                제작사
                              </span>
                              <span className="staff-name text-content">
                                {anime.productionCompanies
                                  .map((c) => c.name)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="tab-placeholder p-5 text-center text-subtle py-20">
                  <p>준비 중입니다</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="error-state p-8 text-center text-subtle">
            <p className="text-3xl mb-3">😢</p>
            <p>정보를 불러오지 못했습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimeDetailModal;
