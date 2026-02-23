'use client'

import { signOut } from '@/src/app/api/auth/signout/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/other - shadcn/dropdown-menu'
import { ChevronDown, LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/src/components/ui/buttons/button'

export default function UserMenu({ user }: { user: User }) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          {user.email}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        className="w-[--radix-popper-anchor-width]"
      >
        <DropdownMenuItem className="cursor-pointer" onClick={handleClick}>
          {loading ? (
            'Signing out...'
          ) : (
            <>
              {' '}
              <LogOut /> Sign out{' '}
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
