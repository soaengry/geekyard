import { FC, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAnimeFilter, getAnimeList } from "../api/animeApi";
import AnimeCard from "../components/AnimeCard";
import AnimeDetailModal from "../components/AnimeDetailModal";
import AnimeFilterBar from "../components/AnimeFilterBar";
import AnimeSidebar from "../components/AnimeSidebar";
import MobileFilterDrawer from "../components/MobileFilterDrawer";
import type { AnimeFilter, AnimeListItem } from "../types";

const AnimeListPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<AnimeListItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterData, setFilterData] = useState<AnimeFilter | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const query = searchParams.get("q") ?? "";
  const genres = searchParams.getAll("genres");
  const tags = searchParams.getAll("tags");
  const years = searchParams.getAll("years");

  const filterKey = `${query}|${genres.join(",")}|${tags.join(",")}|${years.join(",")}`;

  const activeFilterCount =
    genres.length + tags.length + years.length;

  // 필터 옵션 1회 fetch
  useEffect(() => {
    getAnimeFilter()
      .then(setFilterData)
      .catch(() => {});
  }, []);

  // 필터 변경 시 초기화 후 첫 페이지 fetch
  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setInitialLoading(true);
    setFetchError(false);

    getAnimeList({
      q: query || undefined,
      genres,
      tags,
      years,
      page: 0,
      size: 20,
    })
      .then((data) => {
        setItems(data.content);
        setTotalElements(data.totalElements);
        setHasMore(data.number < data.totalPages - 1);
      })
      .catch(() => setFetchError(true))
      .finally(() => setInitialLoading(false));
  }, [filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // 페이지 증가 시 추가 fetch (append)
  useEffect(() => {
    if (page === 0) return;
    setLoadingMore(true);
    getAnimeList({
      q: query || undefined,
      genres,
      tags,
      years,
      page,
      size: 20,
    })
      .then((data) => {
        setItems((prev) => [...prev, ...data.content]);
        setTotalElements(data.totalElements);
        setHasMore(data.number < data.totalPages - 1);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // IntersectionObserver — 하단 sentinel 감지 시 다음 페이지 로드
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingMore || initialLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, initialLoading]);

  const handleQueryChange = (q: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (q) next.set("q", q);
      else next.delete("q");
      return next;
    });
  };

  const handleGenreToggle = (genre: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const current = next.getAll("genres");
      next.delete("genres");
      if (current.includes(genre)) {
        current
          .filter((g) => g !== genre)
          .forEach((g) => next.append("genres", g));
      } else {
        [...current, genre].forEach((g) => next.append("genres", g));
      }
      return next;
    });
  };

  const handleTagToggle = (tag: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const current = next.getAll("tags");
      next.delete("tags");
      if (current.includes(tag)) {
        current
          .filter((t) => t !== tag)
          .forEach((t) => next.append("tags", t));
      } else {
        [...current, tag].forEach((t) => next.append("tags", t));
      }
      return next;
    });
  };

  const handleYearToggle = (year: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const current = next.getAll("years");
      next.delete("years");
      if (current.includes(year)) {
        current
          .filter((y) => y !== year)
          .forEach((y) => next.append("years", y));
      } else {
        [...current, year].forEach((y) => next.append("years", y));
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("genres");
      next.delete("tags");
      next.delete("years");
      return next;
    });
  };

  return (
    <div className="anime-list-page container mx-auto px-4 py-8">
      <div className="page-header flex items-center justify-between mb-6">
        <h1 className="page-title text-2xl font-bold text-content">
          애니메이션
        </h1>
        {!initialLoading && !fetchError && (
          <span className="result-count text-sm text-subtle">
            총 {totalElements.toLocaleString()}개
          </span>
        )}
      </div>

      <div className="page-layout flex gap-8">
        {/* Left Sidebar — desktop only */}
        <aside className="sidebar-wrapper hidden md:block w-52 shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 custom-scrollbar hover-scrollbar">
            <AnimeSidebar
              availableGenres={filterData?.genres ?? []}
              availableTags={filterData?.tags ?? []}
              availableYears={filterData?.years ?? []}
              selectedGenres={genres}
              selectedTags={tags}
              selectedYears={years}
              onGenreToggle={handleGenreToggle}
              onTagToggle={handleTagToggle}
              onYearToggle={handleYearToggle}
              onClear={handleClearFilters}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className="content-area flex-1 min-w-0">
          <div className="filter-bar-wrapper mb-6 flex items-start gap-3">
            {/* Mobile filter button */}
            <button
              className="mobile-filter-btn md:hidden shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-content/20 bg-surface text-content hover:border-primary hover:text-primary transition-colors"
              onClick={() => setMobileFilterOpen(true)}
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">필터</span>
              {activeFilterCount > 0 && (
                <span className="filter-badge w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <AnimeFilterBar
                availableGenres={filterData?.genres ?? []}
                query={query}
                selectedGenres={genres}
                onQueryChange={handleQueryChange}
                onGenreToggle={handleGenreToggle}
              />
            </div>
          </div>

          {initialLoading ? (
            <div className="skeleton-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-lg bg-content/10 animate-pulse"
                />
              ))}
            </div>
          ) : fetchError ? (
            <div className="error-state text-center py-20 text-subtle">
              <p className="text-4xl mb-4">⚠️</p>
              <p className="text-lg font-medium">
                데이터를 불러오지 못했습니다
              </p>
              <p className="text-sm mt-2">서버 연결을 확인해주세요</p>
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="anime-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map((anime) => (
                  <AnimeCard
                    key={anime.id}
                    anime={anime}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="scroll-sentinel h-4 mt-4" />

              {loadingMore && (
                <div className="loading-more-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] rounded-lg bg-content/10 animate-pulse"
                    />
                  ))}
                </div>
              )}

              {!hasMore && (
                <p className="end-message text-center text-subtle text-sm py-8">
                  모든 애니메이션을 불러왔습니다 ({items.length}개)
                </p>
              )}
            </>
          ) : (
            <div className="empty-state text-center py-20 text-subtle">
              <p className="text-4xl mb-4">🎬</p>
              <p className="text-lg font-medium">검색 결과가 없습니다</p>
              <p className="text-sm mt-2">
                다른 검색어나 장르를 시도해보세요
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterDrawer
        open={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        availableGenres={filterData?.genres ?? []}
        availableTags={filterData?.tags ?? []}
        availableYears={filterData?.years ?? []}
        selectedGenres={genres}
        selectedTags={tags}
        selectedYears={years}
        onGenreToggle={handleGenreToggle}
        onTagToggle={handleTagToggle}
        onYearToggle={handleYearToggle}
        onClear={handleClearFilters}
      />

      {selectedId && (
        <AnimeDetailModal
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default AnimeListPage;
