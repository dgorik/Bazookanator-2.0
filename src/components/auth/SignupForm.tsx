'use client'
import { useState, useTransition } from 'react'
import { cn } from '@/src/utils/utils'
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
import { signupSchema } from '@/src/lib/validations/auth'

import { signup } from '@/src/app/api/auth/signup/actions'

export default function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [status, setStatus] = useState<{
    type: 'error' | 'success'
    message: string
  } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = signupSchema.safeParse({
      email,
      password,
      firstName,
      lastName,
    })

    if (!result.success) {
      setStatus({ type: 'error', message: result.error.issues[0].message })
      return // Stop here, don't call the server
    }

    startTransition(async () => {
      try {
        const response = await signup(result.data)

        if (response?.error) {
          setStatus({ type: 'error', message: response.error })
          return
        }
        setStatus({
          type: 'success',
          message:
            'If this email is not registered yet, you’ll receive a confirmation email shortly.',
        })
        setEmail('')
        setPassword('')
        setFirstName('')
        setLastName('')
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
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your information to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  type="text"
                  value={firstName}
                  required
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Bazooka"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  type="text"
                  value={lastName}
                  required
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Joe"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="@bazooka-inc.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <LoadingSpinner size={16} color="blue" />}
              {isPending ? 'Loading...' : 'Create Account'}
            </Button>
          </div>
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
