import axiosInstance from '../../../global/api/axiosInstance'
import { ANIME_ENDPOINTS } from '../anime.constants'
import type {
  AnimeDetail,
  AnimeFilter,
  AnimeListItem,
  CreateReviewRequest,
  PageResponse,
  ReviewResponse,
  ReviewStatsResponse,
  UpdateReviewRequest,
} from '../types'

interface AnimeListParams {
  q?: string
  genres?: string[]
  tags?: string[]
  years?: string[]
  page?: number
  size?: number
}

export const getAnimeFilter = async (): Promise<AnimeFilter> => {
  const response = await axiosInstance.get<{ data: AnimeFilter }>(`${ANIME_ENDPOINTS.LIST}/filter`)
  return response.data.data
}

export const getAnimeList = async (params: AnimeListParams = {}): Promise<PageResponse<AnimeListItem>> => {
  const { q, genres, tags, years, page = 0, size = 20 } = params

  const searchParams = new URLSearchParams()
  if (q) searchParams.append('q', q)
  genres?.forEach((g) => searchParams.append('genres', g))
  tags?.forEach((t) => searchParams.append('tags', t))
  years?.forEach((y) => searchParams.append('years', y))
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
