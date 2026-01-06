'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { updateUser } from '@/src/app/api/auth/update_user/actions'

export default function UpdatePassword({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<{
    type: string
    message: string
  } | null>(null)
  const searchParams = useSearchParams()

  const success = searchParams.get('success')
  useEffect(() => {
    if (success) {
      setStatus({ type: 'success', message: success })
    }
  }, [success])

  const handlePostUsers = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match' })
      return
    }
    if (password.length < 6) {
      setStatus({
        type: 'error',
        message: 'Password should be at least 6 characters long',
      })
      return
    }
    try {
      const response = await updateUser({
        password,
      })

      if (response.error) {
        setStatus({ type: 'error', message: response.error })
        return
      }
      if (response.success) {
        setStatus({ type: 'success', message: response.success })
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error has occured'
      setStatus({ type: 'error', message })
    }
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`} {...props}>
      <CardHeader>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>Please enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePostUsers} className="flex flex-col gap-6 mb-3">
          <div className="grid gap-2">
            <Label htmlFor="password">Enter Your New Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setStatus(null)
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Confirm your New Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setStatus(null)
              }}
            />
          </div>

          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>

        {status?.type && (
          <div
            className={`flex justify-center mt-2 ${status.type === 'error' ? 'text-red-600' : 'text-green-600'}`}
          >
            {status.message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
