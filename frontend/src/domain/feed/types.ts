export interface FeedResponse {
  id: number
  userId: number
  nickname: string
  profileImage: string | null
  animeId: number | null
  animeName: string | null
  animeImg: string | null
  content: string
  imageUrls: string[]
  likeCount: number
  commentCount: number
  liked: boolean
  bookmarked: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFeedRequest {
  animeId?: number
  content: string
}

export interface UpdateFeedRequest {
  content?: string
}

export interface CommentResponse {
  id: number
  feedId: number
  userId: number
  nickname: string
  profileImage: string | null
  content: string
  createdAt: string
  updatedAt: string
}

export interface LikeToggleResponse {
  liked: boolean
  likeCount: number
}

export interface BookmarkToggleResponse {
  bookmarked: boolean
}
