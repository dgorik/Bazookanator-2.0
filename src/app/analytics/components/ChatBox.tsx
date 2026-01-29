'use client'

import {
  Card,
  CardContent,
  CardFooter,
} from '@/src/components/ui/other - shadcn/card'
import { Input } from '@/src/components/ui/other - shadcn/input'
import { Send } from 'lucide-react'
import { Button } from '@/src/components/ui/buttons/button'
import { useState } from 'react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'How can I help you?',
      sender: 'bot',
    },
  ])

  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')

    try {
      const response = await fetch('/api/analytics/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuestion: inputValue }),
      })

      const data = await response.json()

      const botReply: Message = {
        id: (Date.now() + 1).toString(),
        content: data.summary || 'Sorry, I didn’t catch that.',
        sender: 'bot',
      }

      setMessages((prev) => [...prev, botReply])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content: 'Something went wrong. Please try again.',
          sender: 'bot',
        },
      ])
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {isOpen && (
        <Card className="w-[320px] sm:w-[360px] shadow-xl">
          <CardContent className="flex max-h-[360px] flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="text-sm font-medium">Analytics Chat</span>
              <Button
                onClick={() => setIsOpen(false)}
                size="sm"
                type="button"
                variant="ghost"
              >
                Close
              </Button>
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`max-w-[80%] px-3 py-2 rounded-md text-sm ${
                    msg.sender === 'user'
                      ? 'ml-auto bg-blue-100 text-right'
                      : 'mr-auto bg-gray-100 text-left'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50 p-3">
            <div className="flex w-full gap-2">
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Button onClick={handleSend} size="icon" type="button">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-12 w-12 rounded-full shadow-lg"
        size="icon"
        type="button"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}
