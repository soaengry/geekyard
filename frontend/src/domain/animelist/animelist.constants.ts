export const ANIMELIST_ENDPOINTS = {
  LIST: '/api/anime-lists',
  ME: '/api/anime-lists/me',
  DETAIL: (id: number) => `/api/anime-lists/${id}`,
  ITEMS: (id: number) => `/api/anime-lists/${id}/items`,
  ITEM: (id: number, animeId: number) => `/api/anime-lists/${id}/items/${animeId}`,
  LIKE: (id: number) => `/api/anime-lists/${id}/like`,
} as const
