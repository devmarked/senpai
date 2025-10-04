// src/routes/account/+page.server.ts
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { 
  getProfile, 
  updateProfile, 
  generateSlug,
  getDashboardStats,
  getUpcomingSessions,
  getRecentThreads,
  getActiveSubscriptions
} from '$lib/server/db'

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
  const { user } = await safeGetSession()

  if (!user) {
    redirect(303, '/auth/login')
  }

  // Load dashboard data in parallel
  const [profile, stats, upcomingSessions, recentThreads, activeSubscriptions] = await Promise.all([
    getProfile(supabase, user.id),
    getDashboardStats(supabase, user.id),
    getUpcomingSessions(supabase, user.id, 3),
    getRecentThreads(supabase, user.id, 4),
    getActiveSubscriptions(supabase, user.id)
  ])


  return {
    user,
    profile,
    stats,
    upcomingSessions,
    recentThreads,
    activeSubscriptions
  }
}

export const actions: Actions = {
  update: async ({ request, locals: { supabase, user } }) => {
    if (!user) {
      return fail(401, { message: 'Unauthorized' })
    }

    const formData = await request.formData()
    const full_name = formData.get('full_name') as string
    const bio = formData.get('bio') as string
    const role = formData.get('role') as string

    try {
      // Get current profile to check if slug exists
      const currentProfile = await getProfile(supabase, user.id)
      
      // If becoming a mentor and no slug exists, generate one
      let slug = currentProfile.slug
      if ((role === 'mentor' || role === 'both') && !slug) {
        // Generate slug from full name or email
        const nameForSlug = full_name || currentProfile.full_name || user.email?.split('@')[0] || 'mentor'
        slug = await generateSlug(supabase, nameForSlug, user.id)
      }

      await updateProfile(supabase, user.id, {
        full_name,
        bio,
        role,
        slug: slug || undefined,
      })

      return { success: true }
    } catch (error) {
      console.error('Profile update error:', error)
      return fail(500, { message: 'Failed to update profile' })
    }
  },

  signout: async ({ locals: { supabase } }) => {
    await supabase.auth.signOut()
    redirect(303, '/')
  },
}

