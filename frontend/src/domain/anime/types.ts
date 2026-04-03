export interface AnimeListItem {
  id: number
  name: string
  img: string
  genres: string[]
  avgRating: number
  medium: string
  isAdult: boolean
}

export interface AnimeImage {
  optionName: string
  imgUrl: string
  cropRatio: string
}

export interface AnimeCast {
  characterName: string
  voiceActorNames: string[]
}

export interface AnimeDirector {
  name: string
  role: string
}

export interface AnimeHighlightVideo {
  contentId: string
  dashUrl: string
  hlsUrl: string
}

export interface AnimeDetail {
  id: number
  name: string
  img: string
  images: AnimeImage[]
  highlightVideo: AnimeHighlightVideo | null
  genres: string[]
  tags: string[]
  content: string
  avgRating: number
  casts: AnimeCast[]
  directors: AnimeDirector[]
  productionCompanies: { name: string }[]
  medium: string
  isAdult: boolean
  airYearQuarter: string
  seriesId: number
  watched: boolean | null
}

export interface AnimeFilter {
  genres: string[]
  tags: string[]
  years: string[]
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ReviewResponse {
  id: number
  userId: number
  nickname: string
  profileImage: string | null
  animeId: number
  animeName: string
  score: number
  content: string
  likeCount: number
  liked: boolean
  createdAt: string
  updatedAt: string
}

export interface ReviewStatsResponse {
  averageScore: number
  totalCount: number
}

export interface SimilarAnimeItem {
  id: number
  name: string
  img: string
  genres: string[]
  avgRating: number
  medium: string
  isAdult: boolean
  similarity: number
}

export type AnimeSortType = 'popular' | 'latest' | 'reviewCount' | 'rating'

export interface RecommendationItem {
  id: number
  name: string
  img: string
  genres: string[]
  avgRating: number
  medium: string
  isAdult: boolean
  score: number | null
  reason: string
}

export interface CreateReviewRequest {
  score: number
  content: string
}

export interface UpdateReviewRequest {
  score?: number
  content?: string
}

export interface WatchedCalendarItem {
  date: string
  animeId: number
  animeName: string
  animeImg: string | null
  score: number | null
}

export interface MonthlyCount {
  month: string
  count: number
}

export interface GenreRatio {
  genre: string
  count: number
}

export interface GenreAvgRating {
  genre: string
  avgRating: number
}

export interface WatchedStatistics {
  monthlyCounts: MonthlyCount[]
  genreRatios: GenreRatio[]
  genreAvgRatings: GenreAvgRating[]
}
