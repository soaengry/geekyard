export const ANIME_ENDPOINTS = {
  LIST: "/api/anime",
  DETAIL: (id: number) => `/api/anime/${id}`,
  REVIEWS: (animeId: number) => `/api/anime/${animeId}/reviews`,
  REVIEW_STATS: (animeId: number) => `/api/anime/${animeId}/reviews/stats`,
  MY_REVIEW: (animeId: number) => `/api/anime/${animeId}/reviews/mine`,
  REVIEW: (animeId: number, reviewId: number) =>
    `/api/anime/${animeId}/reviews/${reviewId}`,
};
