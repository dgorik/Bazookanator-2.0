'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/src/components/ui/buttons/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/src/components/ui/sheet/sheet'

interface RouteProps {
  href: string
  label: string
}

const routeList: RouteProps[] = [
  {
    href: '#testimonials',
    label: 'Testimonials',
  },
  {
    href: '#team',
    label: 'Team',
  },
  {
    href: '#contact',
    label: 'Contact',
  },
  {
    href: '#faq',
    label: 'FAQ',
  },
]

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Menu className="cursor-pointer lg:hidden" />
        </SheetTrigger>
        <SheetContent side="right" className="w-[250px]">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Select an option below.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-4 px-2">
            {routeList.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-base"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </a>
            ))}

            <Button asChild className="w-1/2">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="w-1/2">
              <Link href="/auth/signup">Sign Up</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
