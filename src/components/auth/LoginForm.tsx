'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/src/utils/utils'
import { loginSchema } from '@/src/lib/validations/auth'
import Link from 'next/link'
import { Button } from '@/src/components/ui/buttons/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/other - shadcn/card'
import { Input } from '@/src/components/ui/other - shadcn/input'
import { Label } from '@/src/components/ui/other - shadcn/label'
import { LoadingSpinner } from '@/src/components/ui/loading_spinner/loading_spinner'
import { login } from '@/src/app/api/auth/login/actions'

export default function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{
    type: 'error' | 'success'
    message: string
  } | null>(null)

  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')

    if (success) {
      setStatus({ type: 'success', message: success })
    } else if (error) {
      setStatus({ type: 'error', message: error })
    }
  }, [])

  const handlePostUsers = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = loginSchema.safeParse({
      email,
      password,
    })

    if (!result.success) {
      setStatus({ type: 'error', message: result.error.issues[0].message })
      return
    }

    setStatus(null)
    startTransition(async () => {
      try {
        //'await' pauses THIS function, but yields control back to main thread
        const response = await login(result.data)
        //Resumes here only when promise resolves
        if (response.success) {
          router.push('/analytics')
          return
        }
        if (response?.error) {
          setStatus({ type: 'error', message: response.error })
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred'
        setStatus({ type: 'error', message: message })
      }
    })
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)} {...props}>
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handlePostUsers}
          noValidate
          className="flex flex-col gap-6 mb-3"
        >
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="@bazooka-inc.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="enter your password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <LoadingSpinner size={16} color="blue" />}
            {isPending ? 'Loading...' : 'Login'}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/forgot-password">Forgot Password</Link>
          </Button>
        </form>
        {status ? (
          <div
            className={`flex justify-center mt-2 ${status.type === 'error' ? 'text-red-600' : 'text-green-600'}`}
          >
            {status.message}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
