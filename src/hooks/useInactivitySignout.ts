'use client'

import { createClient } from '@/src/lib/client/supabase/client'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

const InactivityTimeout = 1000 * 60 * 30
const LastActivityKey = 'lastActivityTimestamp'

function updateLastActivity() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LastActivityKey, Date.now().toString())
  }
}

export function useInactivitySignout() {
  const router = useRouter()
  const timeoutRef = useRef<number | null>(null) //this lets us store the timout ID across renders without causing re-renders

  const signOutUser = useCallback(async () => {
    if (typeof window === 'undefined') return //The typeof window check ensures it only runs in the browser (not during SSR)

    const lastActiveTime = localStorage.getItem(LastActivityKey)
    if (lastActiveTime) {
      const elapsed = Date.now() - parseInt(lastActiveTime, 10)
      if (elapsed >= InactivityTimeout) {
        const supabase = createClient()
        await supabase.auth.signOut()
        localStorage.removeItem(LastActivityKey)
        router.replace(
          '/auth/login?error=Your+session+has+expired,+please+log+in+again',
        )
      }
    } else {
      return
    }
  }, [router])

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    updateLastActivity()
    timeoutRef.current = window.setTimeout(signOutUser, InactivityTimeout)
  }, [signOutUser])

  useEffect(() => {
    resetTimer()
    const activityEvents = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ]
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer)
    })

    function handleStorageEvent(event: StorageEvent) {
      // If another tab was active (updated the key), reset this tab's timer
      if (event.key === LastActivityKey) {
        resetTimer()
      }
    }
    window.addEventListener('storage', handleStorageEvent)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer)
      })
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [resetTimer])
  // because we use useCallback for resetTimer, the useEffect will only run once on mount and when resetTimer changes (which it won't, unless signOutUser changes)
  // The cleanup runs when the component unmounts or right before a re-run (if resetTimer changed).
}
