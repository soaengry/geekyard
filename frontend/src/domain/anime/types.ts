export interface AnimeListItem {
  id: string
  name: string
  img: string
  genres: string[]
  avgRating: number
  medium: string
  isAdult: boolean
  isEnding: boolean
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
  id: string
  laftelId: number
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
  isEnding: boolean
  airYearQuarter: string
  contentRating: string
  seriesId: number
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
