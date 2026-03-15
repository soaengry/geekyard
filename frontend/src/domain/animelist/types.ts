export interface AnimeListItemInfo {
  animeId: number
  animeName: string
  animeImg: string | null
  orderIndex: number
}

export interface AnimeListSummary {
  id: number
  title: string
  description: string | null
  coverImages: string[]
  authorNickname: string
  authorProfileImage: string | null
  likeCount: number
  itemCount: number
  liked: boolean
  createdAt: string
}

export interface AnimeListDetail {
  id: number
  title: string
  description: string | null
  coverImages: string[]
  authorNickname: string
  authorProfileImage: string | null
  likeCount: number
  itemCount: number
  liked: boolean
  isOwner: boolean
  isPublic: boolean
  items: AnimeListItemInfo[]
  createdAt: string
  updatedAt: string
}

export interface MyAnimeList {
  id: number
  title: string
  itemCount: number
  createdAt: string
}

export interface CreateAnimeListRequest {
  title: string
  description?: string
  isPublic?: boolean
}

export interface UpdateAnimeListRequest {
  title?: string
  description?: string
  isPublic?: boolean
}
