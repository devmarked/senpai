// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types'
import { getProfile } from '$lib/server/db'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession, supabase }, cookies }) => {
  const { user } = await safeGetSession()

  let profile = null
  if (user) {
    try {
      profile = await getProfile(supabase, user.id)
    } catch (error) {
      // Profile might not exist yet, that's okay
      console.error('Error loading profile:', error)
    }
  }

  return {
    user,
    profile,
    cookies: cookies.getAll(),
  }
}

