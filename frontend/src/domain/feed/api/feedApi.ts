import axiosInstance from '../../../global/api/axiosInstance'
import { FEED_ENDPOINTS, USER_ACTIVITY_ENDPOINTS } from '../feed.constants'
import type {
  FeedResponse,
  CreateFeedRequest,
  CommentResponse,
  LikeToggleResponse,
  BookmarkToggleResponse,
} from '../types'
import type { PageResponse } from '../../anime/types'

const createPagedGetter = <T>(endpoint: string) => {
  return async (page = 0, size = 10): Promise<PageResponse<T>> => {
    const response = await axiosInstance.get<{ data: PageResponse<T> }>(
      `${endpoint}?page=${page}&size=${size}`,
    )
    return response.data.data
  }
}

export const getFeeds = async (
  page = 0,
  size = 10,
  animeId?: number,
): Promise<PageResponse<FeedResponse>> => {
  const params = new URLSearchParams()
  params.append('page', String(page))
  params.append('size', String(size))
  if (animeId) params.append('animeId', String(animeId))
  const response = await axiosInstance.get<{ data: PageResponse<FeedResponse> }>(
    `${FEED_ENDPOINTS.LIST}?${params.toString()}`,
  )
  return response.data.data
}

export const getFeed = async (feedId: number): Promise<FeedResponse> => {
  const response = await axiosInstance.get<{ data: FeedResponse }>(
    FEED_ENDPOINTS.DETAIL(feedId),
  )
  return response.data.data
}

export const createFeed = async (
  data: CreateFeedRequest,
  files?: File[],
): Promise<FeedResponse> => {
  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(data)], { type: 'application/json' }),
  )
  files?.forEach((file) => formData.append('files', file))
  const response = await axiosInstance.post<{ data: FeedResponse }>(
    FEED_ENDPOINTS.LIST,
    formData,
  )
  return response.data.data
}

export const updateFeed = async (
  feedId: number,
  data: { content?: string },
  files?: File[],
): Promise<FeedResponse> => {
  const formData = new FormData()
  formData.append(
    'request',
    new Blob([JSON.stringify(data)], { type: 'application/json' }),
  )
  files?.forEach((file) => formData.append('files', file))
  const response = await axiosInstance.patch<{ data: FeedResponse }>(
    FEED_ENDPOINTS.DETAIL(feedId),
    formData,
  )
  return response.data.data
}

export const deleteFeed = async (feedId: number): Promise<void> => {
  await axiosInstance.delete(FEED_ENDPOINTS.DETAIL(feedId))
}

export const toggleFeedLike = async (
  feedId: number,
): Promise<LikeToggleResponse> => {
  const response = await axiosInstance.post<{ data: LikeToggleResponse }>(
    FEED_ENDPOINTS.LIKE(feedId),
  )
  return response.data.data
}

export const toggleFeedBookmark = async (
  feedId: number,
): Promise<BookmarkToggleResponse> => {
  const response = await axiosInstance.post<{ data: BookmarkToggleResponse }>(
    FEED_ENDPOINTS.BOOKMARK(feedId),
  )
  return response.data.data
}

export const getComments = async (
  feedId: number,
  page = 0,
  size = 20,
  sort = 'LATEST',
): Promise<PageResponse<CommentResponse>> => {
  const response = await axiosInstance.get<{
    data: PageResponse<CommentResponse>
  }>(`${FEED_ENDPOINTS.COMMENTS(feedId)}?page=${page}&size=${size}&sort=${sort}`)
  return response.data.data
}

export const toggleCommentLike = async (
  feedId: number,
  commentId: number,
): Promise<LikeToggleResponse> => {
  const response = await axiosInstance.post<{ data: LikeToggleResponse }>(
    FEED_ENDPOINTS.COMMENT_LIKE(feedId, commentId),
  )
  return response.data.data
}

export const createComment = async (
  feedId: number,
  content: string,
): Promise<CommentResponse> => {
  const response = await axiosInstance.post<{ data: CommentResponse }>(
    FEED_ENDPOINTS.COMMENTS(feedId),
    { content },
  )
  return response.data.data
}

export const updateComment = async (
  feedId: number,
  commentId: number,
  content: string,
): Promise<CommentResponse> => {
  const response = await axiosInstance.patch<{ data: CommentResponse }>(
    FEED_ENDPOINTS.COMMENT(feedId, commentId),
    { content },
  )
  return response.data.data
}

export const deleteComment = async (
  feedId: number,
  commentId: number,
): Promise<void> => {
  await axiosInstance.delete(FEED_ENDPOINTS.COMMENT(feedId, commentId))
}

export const getMyFeeds = createPagedGetter<FeedResponse>(USER_ACTIVITY_ENDPOINTS.MY_FEEDS)
export const getLikedFeeds = createPagedGetter<FeedResponse>(USER_ACTIVITY_ENDPOINTS.LIKED_FEEDS)
export const getBookmarkedFeeds = createPagedGetter<FeedResponse>(USER_ACTIVITY_ENDPOINTS.BOOKMARKED_FEEDS)
export const getMyComments = createPagedGetter<CommentResponse>(USER_ACTIVITY_ENDPOINTS.MY_COMMENTS)
export const getMyImageFeeds = createPagedGetter<FeedResponse>(USER_ACTIVITY_ENDPOINTS.MY_IMAGE_FEEDS)
