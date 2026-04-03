import axiosInstance from '../../../global/api/axiosInstance'
import { CHAT_ENDPOINTS } from '../chat.constants'
import type { ChatMessage } from '../types'

export const getRecentMessages = async (animeId: number): Promise<ChatMessage[]> => {
  const response = await axiosInstance.get<{ data: ChatMessage[] }>(
    CHAT_ENDPOINTS.MESSAGES(animeId),
  )
  return response.data.data
}
