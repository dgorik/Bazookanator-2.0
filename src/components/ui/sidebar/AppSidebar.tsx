// components/ui/sidebar/AppSidebar.tsx
import { Sidebar } from '@/src/components/ui/sidebar/core/sidebar'
import { SideBarContent } from './custom/SideBarContent'
import { SideBarFooter } from './custom/SideBarFooter'
import type { User } from '@supabase/supabase-js'

export function AppSidebar({ user }: { user: User }) {
  return (
    <Sidebar>
      <SideBarContent />
      <SideBarFooter user={user} />
    </Sidebar>
  )
}
