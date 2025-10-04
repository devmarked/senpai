// src/routes/account/profile/+page.server.ts
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { 
  getProfile, 
  updateProfile, 
  generateSlug
} from '$lib/server/db'

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
  const { user } = await safeGetSession()

  if (!user) {
    redirect(303, '/auth/login')
  }

  const profile = await getProfile(supabase, user.id)

  return {
    user,
    profile
  }
}

export const actions: Actions = {
  updateProfile: async ({ request, locals: { supabase, user } }) => {
    if (!user) {
      return fail(401, { message: 'Unauthorized' })
    }

    const formData = await request.formData()
    const full_name = formData.get('full_name') as string
    const bio = formData.get('bio') as string
    const role = formData.get('role') as string
    const avatar_url = formData.get('avatar_url') as string
    const experience_level = formData.get('experience_level') as string
    const topics = formData.get('topics') as string
    const languages_spoken = formData.get('languages_spoken') as string
    const monthly_rate = formData.get('monthly_rate') as string
    const is_available = formData.get('is_available') === 'true'

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

      // Parse arrays from comma-separated strings
      const topicsArray = topics ? topics.split(',').map(t => t.trim()).filter(Boolean) : null
      const languagesArray = languages_spoken ? languages_spoken.split(',').map(l => l.trim()).filter(Boolean) : null

      await updateProfile(supabase, user.id, {
        full_name: full_name || undefined,
        bio: bio || undefined,
        role: role || undefined,
        slug: slug || undefined,
        avatar_url: avatar_url || undefined,
        experience_level: experience_level || undefined,
        topics: topicsArray || undefined,
        languages_spoken: languagesArray || undefined,
        monthly_rate: monthly_rate ? parseFloat(monthly_rate) : undefined,
        is_available
      })

      return { success: true, message: 'Profile updated successfully!' }
    } catch (error) {
      console.error('Profile update error:', error)
      return fail(500, { message: 'Failed to update profile' })
    }
  }
}

