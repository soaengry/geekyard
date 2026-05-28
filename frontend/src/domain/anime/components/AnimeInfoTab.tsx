import { FC } from "react";
import type { AnimeDetail, SimilarAnimeItem } from "../types";

interface AnimeInfoTabProps {
  anime: AnimeDetail;
  similarAnime: SimilarAnimeItem[];
  onAnimeClick: (id: number) => void;
}

const AnimeInfoTab: FC<AnimeInfoTabProps> = ({ anime, similarAnime, onAnimeClick }) => {
  return (
    <div className="tab-info p-5 space-y-5 overflow-y-auto hover-scrollbar">
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
          <span className="info-air-date">{anime.airYearQuarter}</span>
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
                {cast.voiceActorNames && cast.voiceActorNames.length > 0 && (
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
        (anime.productionCompanies && anime.productionCompanies.length > 0)) && (
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
                <span className="staff-name text-content">{d.name}</span>
              </div>
            ))}
            {anime.productionCompanies && anime.productionCompanies.length > 0 && (
              <div className="staff-item flex gap-3">
                <span className="staff-role text-subtle w-16 shrink-0">
                  제작사
                </span>
                <span className="staff-name text-content">
                  {anime.productionCompanies.map((c) => c.name).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {similarAnime.length > 0 && (
        <div className="similar-section">
          <h3 className="section-title text-sm font-bold text-content mb-2">
            비슷한 작품
          </h3>
          <div className="similar-list flex gap-3 overflow-x-auto hover-scrollbar pb-2">
            {similarAnime.map((item) => (
              <div
                key={item.id}
                onClick={() => onAnimeClick(item.id)}
                className="similar-card shrink-0 w-28 cursor-pointer group"
              >
                <div className="similar-card-thumbnail relative aspect-[2/3] rounded-lg overflow-hidden bg-content/10">
                  {item.img ? (
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-subtle text-xs">
                      이미지 없음
                    </div>
                  )}
                  {item.avgRating != null && (
                    <div className="similar-card-rating absolute top-1 right-1 bg-black/70 text-yellow-400 text-[10px] font-bold px-1 py-0.5 rounded">
                      ★ {item.avgRating.toFixed(1)}
                    </div>
                  )}
                </div>
                <p className="similar-card-title text-xs font-medium text-content mt-1.5 line-clamp-2 leading-tight">
                  {item.name}
                </p>
                {item.genres.length > 0 && (
                  <p className="similar-card-genres text-[10px] text-subtle mt-0.5 line-clamp-1">
                    {item.genres.slice(0, 2).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimeInfoTab;
