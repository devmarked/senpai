// src/routes/account/mentor/+page.server.ts
import { redirect, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { 
  getProfile,
  getMentorMentorships,
  getUserSessions,
  getDashboardStats
} from '$lib/server/db'

export const load: PageServerLoad = async ({ locals: { safeGetSession, supabase } }) => {
  const { user } = await safeGetSession()

  if (!user) {
    redirect(303, '/auth/login')
  }

  const profile = await getProfile(supabase, user.id)

  // Check if user is a mentor
  if (profile.role !== 'mentor' && profile.role !== 'both') {
    redirect(303, '/account')
  }

  // Load mentor-specific data in parallel
  const [mentorships, sessions, stats] = await Promise.all([
    getMentorMentorships(supabase, user.id),
    getUserSessions(supabase, user.id, 'mentor'),
    getDashboardStats(supabase, user.id)
  ])

  // Enrich mentorships with upcoming session info
  const now = new Date().toISOString()
  const enrichedMentorships = await Promise.all(
    mentorships.map(async (mentorship: any) => {
      // Get next session for this mentee
      const { data: nextSession } = await supabase
        .from('sessions')
        .select('*')
        .eq('mentor_id', user.id)
        .eq('mentee_id', mentorship.mentee?.id || mentorship.mentee_id)
        .eq('status', 'confirmed')
        .gte('scheduled_at', now)
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single()

      // Get unread messages count from this mentee
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('sender_id', mentorship.mentee?.id || mentorship.mentee_id)
        .eq('recipient_id', user.id)
        .eq('is_read', false)

      return {
        ...mentorship,
        mentee_id: mentorship.mentee?.id || mentorship.mentee_id,
        next_session: nextSession || null,
        unread_messages: unreadCount || 0
      }
    })
  )

  return {
    user,
    profile,
    mentorships: enrichedMentorships,
    sessions,
    stats
  }
}

export const actions: Actions = {
  updateMentorship: async ({ request, locals: { supabase, user } }) => {
    if (!user) {
      return fail(401, { message: 'Unauthorized' })
    }

    const formData = await request.formData()
    const mentorshipId = formData.get('mentorship_id') as string
    const title = formData.get('title') as string
    const goals = formData.get('goals') as string

    try {
      await supabase
        .from('mentorships')
        .update({ title, goals })
        .eq('id', mentorshipId)
        .eq('mentor_id', user.id)

      return { success: true }
    } catch (error) {
      console.error('Mentorship update error:', error)
      return fail(500, { message: 'Failed to update mentorship' })
    }
  }
}

