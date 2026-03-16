import { useCallback, useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import { getAccessToken } from '../../auth/auth.utils'
import { STOMP_DESTINATIONS } from '../chat.constants'
import type { ChatMessage } from '../types'

interface UseChatReturn {
  messages: ChatMessage[]
  connected: boolean
  sendMessage: (animeId: number, message: string) => void
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
}

export const useChat = (animeId: number): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [connected, setConnected] = useState(false)
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
    const client = new Client({
      brokerURL: `${protocol}://${window.location.host}/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true)
        client.subscribe(STOMP_DESTINATIONS.SUBSCRIBE(animeId), (frame) => {
          const msg: ChatMessage = JSON.parse(frame.body)
          setMessages((prev) => [...prev, msg])
        })
      },
      onDisconnect: () => {
        setConnected(false)
      },
      onStompError: () => {
        setConnected(false)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
    }
  }, [animeId])

  const sendMessage = useCallback(
    (targetAnimeId: number, message: string) => {
      if (!clientRef.current?.connected) return
      clientRef.current.publish({
        destination: STOMP_DESTINATIONS.SEND,
        body: JSON.stringify({ animeId: targetAnimeId, message }),
      })
    },
    [],
  )

  return { messages, connected, sendMessage, setMessages }
}
