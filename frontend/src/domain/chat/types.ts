export interface ChatMessage {
  id: number
  animeId: number
  userId: number
  nickname: string
  profileImage: string | null
  message: string
  createdAt: string
}
