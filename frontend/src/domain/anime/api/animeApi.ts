import axiosInstance from '../../../global/api/axiosInstance'
import { ANIME_ENDPOINTS } from '../anime.constants'
import type { AnimeDetail, AnimeFilter, AnimeListItem, PageResponse } from '../types'

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

export const getAnimeDetail = async (id: string): Promise<AnimeDetail> => {
  const response = await axiosInstance.get<{ data: AnimeDetail }>(ANIME_ENDPOINTS.DETAIL(id))
  return response.data.data
}
