export const CHAT_ENDPOINTS = {
  MESSAGES: (animeId: number) => `/api/chat/${animeId}/messages`,
}

export const WS_BROKER_URL = `ws://${window.location.hostname}:8080/ws`

export const STOMP_DESTINATIONS = {
  SUBSCRIBE: (animeId: number) => `/topic/chat/${animeId}`,
  SEND: '/app/chat.send',
}
