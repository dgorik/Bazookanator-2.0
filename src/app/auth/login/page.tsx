import LoginForm from '@/src/components/auth/LoginForm'
import { LoadingSpinner } from '@/src/components/ui/loading_spinner/loading_spinner'
import { Suspense } from 'react'

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Suspense fallback={<LoadingSpinner size={16} color="blue" />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
