'use server'
import { createClient } from '@/src/lib/client/supabase/server'

export async function resetPassword(formData: { email: string }) {
  const supabase = await createClient()
  const email = formData.email
  const { error } = await supabase.auth.resetPasswordForEmail(email, {})
  if (error) {
    return { error: error.message }
  }
  return
}
