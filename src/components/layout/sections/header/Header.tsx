import Link from 'next/link'
import { ChevronsDown } from 'lucide-react'
import { Button } from '@/src/components/ui/buttons/button'
import MobileMenu from './MobileMenu'

interface RouteProps {
  href: string
  label: string
}

const routeList: RouteProps[] = [
  {
    href: '#contact',
    label: 'Contact',
  },
  {
    href: '#faq',
    label: 'FAQ',
  },
]

export default function Header() {
  return (
    <header className="shadow-inner bg-opacity-15 w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center p-2 bg-card">
      <Link href="/" className="flex items-center text-2xl font-bold">
        <ChevronsDown className="bg-gradient-to-tr border-secondary from-primary via-primary/70 to-primary rounded-lg w-9 h-9 mr-2 border text-white" />
        Bazookanator
      </Link>

      {/* <!-- Desktop --> */}
      <div className="hidden lg:block mx-auto">
        <nav>
          {routeList.map(({ href, label }) => (
            <a key={href} href={href} className="text-base px-2">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex gap-2"></div>
      </div>
      {/* <!-- Mobile --> */}
      <MobileMenu />
      {/* <!-- Mobile --> */}
      <div className="hidden lg:flex gap-2">
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </div>
    </header>
  )
}
