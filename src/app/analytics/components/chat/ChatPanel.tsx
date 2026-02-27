'use client'

import { Input } from '@/src/components/ui/other - shadcn/input'
import { Send, X } from 'lucide-react'
import { Button } from '@/src/components/ui/buttons/button'
import { TypingIndicator } from '@/src/app/analytics/components/visuals/TypingIndicator'
import { useState, useRef, useEffect } from 'react'
import { useChatPanel } from './ChatPanelContext'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
}

export default function ChatPanel() {
  const { isOpen, close } = useChatPanel()

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'How can I help you, JEN JEN LUIS?',
      sender: 'bot',
    },
  ])

  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue,
      sender: 'user',
    }

    const newMessages = [...messages, userMessage]

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/analytics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuestion: newMessages }),
      })

      const data = await response.json()

      const botReply: Message = {
        id: crypto.randomUUID(),
        content: data.summary || 'Sorry, I didn\u2019t catch that.',
        sender: 'bot',
      }

      setMessages((prev) => [...prev, botReply])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: 'Something went wrong. Please try again.',
          sender: 'bot',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <aside
      className={`flex h-full flex-col border-l bg-white transition-all duration-200 ${
        isOpen ? 'w-[350px]' : 'w-0 overflow-hidden border-l-0'
      }`}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-semibold">
          Ask away, AI & Your Sales Insights{' '}
        </span>
        <Button onClick={close} size="icon" variant="ghost">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${
              msg.sender === 'user'
                ? 'ml-auto bg-blue-100 text-right'
                : 'mr-auto bg-gray-100 text-left'
            }`}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={scrollRef} />
      </div>

      <div className="border-t p-3">
        <form onSubmit={handleSend} className="flex w-full gap-2">
          <Input
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button
            size="icon"
            type="submit"
            disabled={!inputValue.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </aside>
  )
}
