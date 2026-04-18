import { FC, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useScrollLock } from "../../../global/hooks/useScrollLock";
import { useAuthStore } from "../../auth/store/useAuthStore";
import {
  getAnimeDetail,
  getSimilarAnime,
  toggleAnimeWatch,
} from "../api/animeApi";
import type { AnimeDetail, SimilarAnimeItem } from "../types";
import AnimeInfoTab from "./AnimeInfoTab";
import ReviewTab from "./ReviewTab";
import FeedForm from "../../feed/components/FeedForm";
import FeedList from "../../feed/components/FeedList";
import AddToListModal from "../../animelist/components/AddToListModal";
import ChatTab from "../../chat/components/ChatTab";

interface AnimeDetailModalProps {
  id: number;
  onClose: () => void;
}

const TABS = ["정보", "리뷰", "피드", "톡톡"] as const;
type Tab = (typeof TABS)[number];

const AnimeDetailModal: FC<AnimeDetailModalProps> = ({ id, onClose }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [currentId, setCurrentId] = useState(id);
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("정보");
  const [feedRefreshKey, setFeedRefreshKey] = useState(0);
  const [watched, setWatched] = useState<boolean | null>(null);
  const [showAddToList, setShowAddToList] = useState(false);
  const [similarAnime, setSimilarAnime] = useState<SimilarAnimeItem[]>([]);
  useScrollLock(true);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    setCurrentId(id);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setAnime(null);
    setSimilarAnime([]);
    setActiveTab("정보");
    getAnimeDetail(currentId)
      .then((data) => {
        setAnime(data);
        setWatched(data.watched);
      })
      .catch(() => setAnime(null))
      .finally(() => setLoading(false));
    getSimilarAnime(currentId)
      .then(setSimilarAnime)
      .catch(() => setSimilarAnime([]));
  }, [currentId]);

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

  const handleToggleWatch = async () => {
    if (!anime) return;
    try {
      const result = await toggleAnimeWatch(anime.id);
      setWatched(result.watched);
    } catch {
      toast.error("봤어요 처리에 실패했습니다.");
    }
  };

  const handleWatchStatusChange = () => {
    setWatched(true);
  };

  return (
    <div
      className="anime-detail-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="anime-detail-backdrop absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="anime-detail-modal relative z-10 bg-surface rounded-2xl w-full max-w-2xl h-[85vh] overflow-y-auto hover-scrollbar md:overflow-hidden md:flex md:flex-col shadow-2xl"
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
                <div className="hero-meta flex items-center gap-3 mt-1">
                  {anime.avgRating != null && (
                    <p className="hero-rating text-yellow-400 text-sm">
                      ★ {anime.avgRating.toFixed(1)}
                    </p>
                  )}
                  {isAuthenticated && (
                    <>
                      <button
                        onClick={handleToggleWatch}
                        className={`watch-btn text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                          watched
                            ? "bg-primary text-white"
                            : "bg-white/20 text-white hover:bg-white/30"
                        }`}
                      >
                        {watched ? "봤어요 ✓" : "봤어요"}
                      </button>
                      <button
                        onClick={() => setShowAddToList(true)}
                        className="add-to-list-btn text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                      >
                        + 리스트
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Scrollable body — desktop: flex-1 scroll, mobile: handled by parent */}
            <div
              className={`detail-body md:flex-1 md:min-h-0 flex flex-col ${activeTab === "톡톡" ? "" : "md:overflow-y-auto hover-scrollbar"}`}
            >
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
                <AnimeInfoTab
                  anime={anime}
                  similarAnime={similarAnime}
                  onAnimeClick={setCurrentId}
                />
              ) : activeTab === "리뷰" ? (
                <ReviewTab
                  animeId={anime.id}
                  onWatchStatusChange={handleWatchStatusChange}
                />
              ) : activeTab === "피드" ? (
                <div className="tab-feed p-5 space-y-4 overflow-y-auto hover-scrollbar">
                  {isAuthenticated && (
                    <FeedForm
                      preSelectedAnimeId={anime.id}
                      preSelectedAnimeName={anime.name}
                      onCreated={() => setFeedRefreshKey((k) => k + 1)}
                    />
                  )}

                  <FeedList animeId={anime.id} refreshKey={feedRefreshKey} />
                </div>
              ) : (
                <ChatTab animeId={anime.id} />
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
      {showAddToList && anime && (
        <AddToListModal
          animeId={anime.id}
          animeName={anime.name}
          onClose={() => setShowAddToList(false)}
        />
      )}
    </div>
  );
};

export default AnimeDetailModal;
