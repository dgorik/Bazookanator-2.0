'use client'

import { signOut } from '@/src/app/api/auth/signout/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/src/components/ui/sidebar/core/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/other - shadcn/dropdown-menu'
import type { User } from '@supabase/supabase-js'

export function SideBarFooter({ user }: { user: User }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const handleClick = async () => {
    setLoading(true)
    const response = await signOut()
    if (response?.message) {
      router.replace('/')
    } else {
      setLoading(false)
    }
  }
  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>{user.email}</SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleClick}
              >
                {loading ? 'Signing out...' : 'Sign out'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  )
}
