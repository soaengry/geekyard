import { FC, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../../auth/store/useAuthStore'
import { getRecentMessages } from '../api/chatApi'
import { useChat } from '../hooks/useChat'
import type { ChatMessage } from '../types'

interface ChatTabProps {
  animeId: number
}

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

const ChatTab: FC<ChatTabProps> = ({ animeId }) => {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { messages, connected, sendMessage, setMessages } = useChat(animeId)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    getRecentMessages(animeId)
      .then((data) => setMessages(data))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false))
  }, [animeId, setMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || !connected) return
    sendMessage(animeId, trimmed)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="chat-loading p-5 text-center text-subtle py-20">
        <p>채팅을 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="chat-tab flex flex-col flex-1 min-h-0">
      <div
        ref={chatContainerRef}
        className="chat-messages flex-1 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="chat-empty text-center text-subtle py-10">
            <p>아직 채팅이 없습니다. 첫 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => {
            const isMe = user?.id === msg.userId
            return (
              <div
                key={msg.id}
                className={`chat-message flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {!isMe && (
                  <div className="chat-avatar shrink-0">
                    {msg.profileImage ? (
                      <img
                        src={msg.profileImage}
                        alt={msg.nickname}
                        className="chat-avatar-img w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="chat-avatar-placeholder w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {msg.nickname.charAt(0)}
                      </div>
                    )}
                  </div>
                )}
                <div
                  className={`chat-bubble max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {!isMe && (
                    <p className="chat-nickname text-xs text-subtle mb-0.5">
                      {msg.nickname}
                    </p>
                  )}
                  <div
                    className={`chat-content px-3 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap ${
                      isMe
                        ? 'bg-primary text-white rounded-tr-sm'
                        : 'bg-content/10 text-content rounded-tl-sm'
                    }`}
                  >
                    {msg.message}
                  </div>
                  <p className="chat-time text-[10px] text-subtle mt-0.5 px-1">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area border-t border-content/10 p-3">
        {isAuthenticated ? (
          <div className="chat-input-wrapper flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={connected ? '메시지를 입력하세요...' : '연결 중...'}
              disabled={!connected}
              rows={1}
              className="chat-textarea flex-1 resize-none bg-background border border-content/20 rounded-xl px-3 py-2 text-sm text-content placeholder:text-subtle focus:outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!connected || !input.trim()}
              className="chat-send-btn shrink-0 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              전송
            </button>
          </div>
        ) : (
          <p className="chat-login-prompt text-center text-subtle text-sm py-2">
            채팅에 참여하려면 로그인해주세요.
          </p>
        )}
      </div>
    </div>
  )
}

export default ChatTab
