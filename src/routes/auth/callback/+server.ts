// src/routes/auth/callback/+server.ts
import type { EmailOtpType } from '@supabase/supabase-js'
import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const next = url.searchParams.get('next') ?? '/account'
  const code = url.searchParams.get('code')

  /**
   * Clean up the redirect URL by deleting the Auth flow parameters.
   *
   * `next` is preserved for now, because it's needed in the error case.
   */
  const redirectTo = new URL(url)
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  redirectTo.searchParams.delete('code')

  // Handle PKCE flow with token_hash
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      redirectTo.searchParams.delete('next')
      redirect(303, redirectTo)
    }
    console.error('Error verifying OTP with token_hash:', error)
  }

  // Handle OAuth callback with code
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirectTo.searchParams.delete('next')
      redirect(303, redirectTo)
    }
    console.error('Error exchanging code for session:', error)
  }

  // For implicit flow magic links, check if session exists
  // (Supabase sets the cookie automatically when user clicks the magic link)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (session && !sessionError) {
    redirectTo.searchParams.delete('next')
    redirect(303, redirectTo)
  }

  console.error('No valid session found, redirecting to error page')
  redirectTo.pathname = '/auth/error'
  redirect(303, redirectTo)
}

