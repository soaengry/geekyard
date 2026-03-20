import axiosInstance from '../../../global/api/axiosInstance'
import { ANIME_ENDPOINTS } from '../anime.constants'
import type {
  AnimeDetail,
  AnimeFilter,
  AnimeListItem,
  CreateReviewRequest,
  PageResponse,
  RecommendationItem,
  ReviewResponse,
  ReviewStatsResponse,
  SimilarAnimeItem,
  UpdateReviewRequest,
} from '../types'

interface AnimeListParams {
  q?: string
  genres?: string[]
  tags?: string[]
  years?: string[]
  sort?: string
  page?: number
  size?: number
}

export const getAnimeFilter = async (): Promise<AnimeFilter> => {
  const response = await axiosInstance.get<{ data: AnimeFilter }>(`${ANIME_ENDPOINTS.LIST}/filter`)
  return response.data.data
}

export const getAnimeList = async (params: AnimeListParams = {}): Promise<PageResponse<AnimeListItem>> => {
  const { q, genres, tags, years, sort, page = 0, size = 20 } = params

  const searchParams = new URLSearchParams()
  if (q) searchParams.append('q', q)
  genres?.forEach((g) => searchParams.append('genres', g))
  tags?.forEach((t) => searchParams.append('tags', t))
  years?.forEach((y) => searchParams.append('years', y))
  if (sort) searchParams.append('sort', sort)
  searchParams.append('page', String(page))
  searchParams.append('size', String(size))

  const response = await axiosInstance.get<{ data: PageResponse<AnimeListItem> }>(
    `${ANIME_ENDPOINTS.LIST}?${searchParams.toString()}`,
  )
  return response.data.data
}

export const getAnimeDetail = async (id: number): Promise<AnimeDetail> => {
  const response = await axiosInstance.get<{ data: AnimeDetail }>(ANIME_ENDPOINTS.DETAIL(id))
  return response.data.data
}

export const getReviews = async (
  animeId: number,
  page = 0,
  size = 10,
): Promise<PageResponse<ReviewResponse>> => {
  const response = await axiosInstance.get<{ data: PageResponse<ReviewResponse> }>(
    `${ANIME_ENDPOINTS.REVIEWS(animeId)}?page=${page}&size=${size}`,
  )
  return response.data.data
}

export const getReviewStats = async (animeId: number): Promise<ReviewStatsResponse> => {
  const response = await axiosInstance.get<{ data: ReviewStatsResponse }>(
    ANIME_ENDPOINTS.REVIEW_STATS(animeId),
  )
  return response.data.data
}

export const getMyReview = async (animeId: number): Promise<ReviewResponse | null> => {
  const response = await axiosInstance.get<{ data: ReviewResponse | null }>(
    ANIME_ENDPOINTS.MY_REVIEW(animeId),
  )
  return response.data.data
}

export const createReview = async (
  animeId: number,
  data: CreateReviewRequest,
): Promise<ReviewResponse> => {
  const response = await axiosInstance.post<{ data: ReviewResponse }>(
    ANIME_ENDPOINTS.REVIEWS(animeId),
    data,
  )
  return response.data.data
}

export const updateReview = async (
  animeId: number,
  reviewId: number,
  data: UpdateReviewRequest,
): Promise<ReviewResponse> => {
  const response = await axiosInstance.patch<{ data: ReviewResponse }>(
    ANIME_ENDPOINTS.REVIEW(animeId, reviewId),
    data,
  )
  return response.data.data
}

export const deleteReview = async (animeId: number, reviewId: number): Promise<void> => {
  await axiosInstance.delete(ANIME_ENDPOINTS.REVIEW(animeId, reviewId))
}

export const toggleReviewLike = async (
  animeId: number,
  reviewId: number,
): Promise<{ liked: boolean; likeCount: number }> => {
  const response = await axiosInstance.post<{
    data: { liked: boolean; likeCount: number }
  }>(ANIME_ENDPOINTS.REVIEW_LIKE(animeId, reviewId))
  return response.data.data
}

export const toggleAnimeWatch = async (animeId: number): Promise<{ watched: boolean }> => {
  const response = await axiosInstance.post<{ data: { watched: boolean } }>(
    ANIME_ENDPOINTS.WATCH(animeId),
  )
  return response.data.data
}

export const getSimilarAnime = async (animeId: number): Promise<SimilarAnimeItem[]> => {
  const response = await axiosInstance.get<{ data: SimilarAnimeItem[] }>(
    ANIME_ENDPOINTS.SIMILAR(animeId),
  )
  return response.data.data
}

export const getRecommendations = async (size = 10): Promise<RecommendationItem[]> => {
  const response = await axiosInstance.get<{ data: RecommendationItem[] }>(
    `${ANIME_ENDPOINTS.RECOMMENDATIONS}?size=${size}`,
  )
  return response.data.data
}

export const saveGenrePreferences = async (genres: string[]): Promise<void> => {
  await axiosInstance.put(ANIME_ENDPOINTS.GENRE_PREFERENCES, { genres })
}

export const getGenrePreferences = async (): Promise<string[]> => {
  const response = await axiosInstance.get<{ data: string[] }>(ANIME_ENDPOINTS.GENRE_PREFERENCES)
  return response.data.data
}

export const checkGenrePreferencesExist = async (): Promise<boolean> => {
  const response = await axiosInstance.get<{ data: { exists: boolean } }>(
    ANIME_ENDPOINTS.GENRE_PREFERENCES_EXISTS,
  )
  return response.data.data.exists
}

