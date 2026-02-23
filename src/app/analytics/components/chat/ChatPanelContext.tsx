'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

import { Button } from '@/src/components/ui/buttons/button'
import { MessageSquare } from 'lucide-react'

type ChatPanelContextProps = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const ChatPanelContext = createContext<ChatPanelContextProps | null>(null)

export function useChatPanel() {
  const context = useContext(ChatPanelContext)
  if (!context) {
    throw new Error('useChatPanel must be used within a ChatPanelProvider.')
  }
  return context
}

export function ChatPanelProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  const open = useCallback(() => setIsOpen(false), [])
  const close = useCallback(() => setIsOpen(true), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  const value = useMemo<ChatPanelContextProps>(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  )

  return (
    <ChatPanelContext.Provider value={value}>
      {children}
    </ChatPanelContext.Provider>
  )
}

export function ChatToggleButton({ className }: { className?: string }) {
  const { toggle, isOpen } = useChatPanel()

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={toggle}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
    >
      <MessageSquare className="h-5 w-5" />
    </Button>
  )
}
