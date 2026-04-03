import axiosInstance from '../../../global/api/axiosInstance'
import { ANIMELIST_ENDPOINTS } from '../animelist.constants'
import type {
  AnimeListSummary,
  AnimeListDetail,
  AnimeListItemInfo,
  MyAnimeList,
  CreateAnimeListRequest,
  UpdateAnimeListRequest,
} from '../types'
import type { PageResponse } from '../../anime/types'
import type { LikeToggleResponse } from '../../feed/types'

export const getMyCollections = async (): Promise<MyAnimeList[]> => {
  const response = await axiosInstance.get<{ data: MyAnimeList[] }>(
    ANIMELIST_ENDPOINTS.ME,
  )
  return response.data.data
}

export const getCollections = async (
  page = 0,
  size = 12,
): Promise<PageResponse<AnimeListSummary>> => {
  const response = await axiosInstance.get<{
    data: PageResponse<AnimeListSummary>
  }>(`${ANIMELIST_ENDPOINTS.LIST}?page=${page}&size=${size}`)
  return response.data.data
}

export const getCollectionDetail = async (
  id: number,
): Promise<AnimeListDetail> => {
  const response = await axiosInstance.get<{ data: AnimeListDetail }>(
    ANIMELIST_ENDPOINTS.DETAIL(id),
  )
  return response.data.data
}

export const createCollection = async (
  data: CreateAnimeListRequest,
): Promise<AnimeListDetail> => {
  const response = await axiosInstance.post<{ data: AnimeListDetail }>(
    ANIMELIST_ENDPOINTS.LIST,
    data,
  )
  return response.data.data
}

export const updateCollection = async (
  id: number,
  data: UpdateAnimeListRequest,
): Promise<AnimeListDetail> => {
  const response = await axiosInstance.patch<{ data: AnimeListDetail }>(
    ANIMELIST_ENDPOINTS.DETAIL(id),
    data,
  )
  return response.data.data
}

export const deleteCollection = async (id: number): Promise<void> => {
  await axiosInstance.delete(ANIMELIST_ENDPOINTS.DETAIL(id))
}

export const addItemToCollection = async (
  id: number,
  animeId: number,
): Promise<AnimeListItemInfo> => {
  const response = await axiosInstance.post<{ data: AnimeListItemInfo }>(
    ANIMELIST_ENDPOINTS.ITEMS(id),
    { animeId },
  )
  return response.data.data
}

export const removeItemFromCollection = async (
  id: number,
  animeId: number,
): Promise<void> => {
  await axiosInstance.delete(ANIMELIST_ENDPOINTS.ITEM(id, animeId))
}

export const toggleCollectionLike = async (
  id: number,
): Promise<LikeToggleResponse> => {
  const response = await axiosInstance.post<{ data: LikeToggleResponse }>(
    ANIMELIST_ENDPOINTS.LIKE(id),
  )
  return response.data.data
}
