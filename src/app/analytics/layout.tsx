import { requireUser } from '@/src/lib/auth/authHelpers'
import SessionTimer from '../../components/session/SessionTimer'
import ChatPanel from './components/chat/ChatPanel'
import {
  ChatPanelProvider,
  ChatToggleButton,
} from './components/chat/ChatPanelContext'
import UserMenu from './components/layout/UserMenu'

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()

  return (
    <div className="h-screen flex flex-col">
      <SessionTimer />
      <ChatPanelProvider>
        <header className="flex items-center justify-between border-b px-4 py-2">
          <h1 className="text-lg font-semibold">Bazookanator</h1>
          <div className="flex items-center gap-2">
            <ChatToggleButton />
            <UserMenu user={user} />
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-2">{children}</main>
          <ChatPanel />
        </div>
      </ChatPanelProvider>
    </div>
  )
}
