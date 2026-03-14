export const FEED_ENDPOINTS = {
  LIST: '/api/feeds',
  DETAIL: (feedId: number) => `/api/feeds/${feedId}`,
  LIKE: (feedId: number) => `/api/feeds/${feedId}/like`,
  BOOKMARK: (feedId: number) => `/api/feeds/${feedId}/bookmark`,
  COMMENTS: (feedId: number) => `/api/feeds/${feedId}/comments`,
  COMMENT: (feedId: number, commentId: number) =>
    `/api/feeds/${feedId}/comments/${commentId}`,
} as const

export const USER_ACTIVITY_ENDPOINTS = {
  MY_FEEDS: '/api/users/me/feeds',
  LIKED_FEEDS: '/api/users/me/liked-feeds',
  BOOKMARKED_FEEDS: '/api/users/me/bookmarked-feeds',
  MY_COMMENTS: '/api/users/me/comments',
  LIKED_REVIEWS: '/api/users/me/liked-reviews',
  BOOKMARKED_REVIEWS: '/api/users/me/bookmarked-reviews',
} as const
