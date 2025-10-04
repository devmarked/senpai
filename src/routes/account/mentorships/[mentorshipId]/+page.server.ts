// src/routes/account/mentorships/[mentorshipId]/+page.server.ts
import { redirect, fail, error } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import { 
  getMentorshipById,
  getMentorshipQnAPosts,
  getMentorshipFiles,
  getNextMentorshipSession,
  createQnAPost,
  createQnAReply,
  createMentorshipFile,
  updateMentorship,
  getThreadMessages,
  markMessagesAsRead
} from '$lib/server/db'

export const load: PageServerLoad = async ({ params, locals: { safeGetSession, supabase }, url }) => {
  const { user } = await safeGetSession()

  if (!user) {
    redirect(303, '/auth/login')
  }

  const { mentorshipId } = params
  
  let mentorship, qnaPosts, files, nextSession
  let allSessions = []
  
  try {
    // Load mentorship data
    console.log('Loading mentorship:', mentorshipId, 'for user:', user.id)
    mentorship = await getMentorshipById(supabase, mentorshipId, user.id)
    console.log('Mentorship loaded successfully:', mentorship.id)
    
    // Load mentorship data
    qnaPosts = await getMentorshipQnAPosts(supabase, mentorshipId).catch(() => [])
    files = await getMentorshipFiles(supabase, mentorshipId).catch(() => [])
    
    // Get all sessions for this mentorship
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .eq('mentorship_id', mentorshipId)
      .order('scheduled_at', { ascending: true })
    
    allSessions = sessionsData || []
    
    // Get the next upcoming session
    nextSession = await getNextMentorshipSession(supabase, mentorshipId).catch(() => null)
  } catch (err: any) {
    console.error('Error loading mentorship:', err)
    error(404, 'Mentorship not found: ' + err.message)
  }

  // Get the other user in the mentorship (if current user is mentor, get mentee)
  const otherUserId = mentorship.mentor_id === user.id 
    ? mentorship.mentee_id 
    : mentorship.mentor_id

  // Create a thread ID based on sorted user IDs for consistency
  const threadId = [user.id, otherUserId].sort().join('-')

  // Get direct messages
  const messages = await getThreadMessages(supabase, threadId, user.id).catch(() => [])
  
  // Mark messages as read
  await markMessagesAsRead(supabase, threadId, user.id).catch(() => {})

  // Get active tab from query params
  const activeTab = url.searchParams.get('tab') || 'overview'

  return {
    user,
    mentorship,
    qnaPosts,
    files,
    nextSession,
    messages,
    threadId,
    activeTab,
    isMentor: mentorship.mentor_id === user.id,
    sessions: allSessions || []
  }
}

export const actions: Actions = {
  sendMessage: async ({ request, locals: { supabase, user } }) => {
    if (!user) {
      return fail(401, { message: 'Unauthorized' })
    }

    const formData = await request.formData()
    const content = formData.get('content') as string
    const threadId = formData.get('thread_id') as string
    const recipientId = formData.get('recipient_id') as string
    const mentorshipId = formData.get('mentorship_id') as string

    if (!content || !threadId || !recipientId) {
      return fail(400, { message: 'Missing required fields' })
    }

    try {
      await supabase.from('messages').insert({
        thread_id: threadId,
        sender_id: user.id,
        recipient_id: recipientId,
        content
      })

      // Update mentorship last interaction
      await supabase
        .from('mentorships')
        .update({ last_interaction_at: new Date().toISOString() })
        .eq('id', mentorshipId)

      return { success: true }
    } catch (error) {
      console.error('Send message error:', error)
      return fail(500, { message: 'Failed to send message' })
    }
  },

  createQnAPost: async ({ request, locals: { supabase, user }, params }) => {
    if (!user) {
      return fail(401, { message: 'Unauthorized' })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const postType = formData.get('post_type') as string || 'question'

    if (!title || !content) {
      return fail(400, { message: 'Title and content are required' })
    }

    try {
      await createQnAPost(supabase, params.mentorshipId, user.id, {
        title,
        content,
        post_type: postType
      })

      return { success: true, action: 'createQnAPost' }
    } catch (error) {
      console.error('Create QnA post error:', error)
      return fail(500, { message: 'Failed to create post' })
    }
  },

  createQnAReply: async ({ request, locals: { supabase, user } }) => {
    if (!user) {
      return fail(401, { message: 'Unauthorized' })
    }

    const formData = await request.formData()
    const postId = formData.get('post_id') as string
    const content = formData.get('content') as string
    const isAcceptedAnswer = formData.get('is_accepted_answer') === 'true'

    if (!postId || !content) {
      return fail(400, { message: 'Post ID and content are required' })
    }

    try {
      await createQnAReply(supabase, postId, user.id, content, isAcceptedAnswer)

      return { success: true, action: 'createQnAReply' }
    } catch (error) {
      console.error('Create QnA reply error:', error)
      return fail(500, { message: 'Failed to create reply' })
    }
  },

  updateMentorship: async ({ request, locals: { supabase, user }, params }) => {
    if (!user) {
      return fail(401, { message: 'Unauthorized' })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const goals = formData.get('goals') as string

    try {
      // Verify user is the mentor
      const { data: mentorship } = await supabase
        .from('mentorships')
        .select('mentor_id')
        .eq('id', params.mentorshipId)
        .single()

      if (mentorship?.mentor_id !== user.id) {
        return fail(403, { message: 'Only mentors can update mentorship details' })
      }

      await updateMentorship(supabase, params.mentorshipId, { title, goals })

      return { success: true, action: 'updateMentorship' }
    } catch (error) {
      console.error('Update mentorship error:', error)
      return fail(500, { message: 'Failed to update mentorship' })
    }
  },

  uploadFile: async ({ request, locals: { supabase, user }, params }) => {
    if (!user) {
      return fail(401, { message: 'Unauthorized' })
    }

    const formData = await request.formData()
    const filename = formData.get('filename') as string
    const fileSize = parseInt(formData.get('file_size') as string)
    const fileType = formData.get('file_type') as string
    const storagePath = formData.get('storage_path') as string
    const storageUrl = formData.get('storage_url') as string
    const description = formData.get('description') as string

    if (!filename || !storagePath || !storageUrl) {
      return fail(400, { message: 'Missing required file information' })
    }

    try {
      await createMentorshipFile(supabase, params.mentorshipId, user.id, {
        filename,
        file_size: fileSize,
        file_type: fileType,
        storage_path: storagePath,
        storage_url: storageUrl,
        description
      })

      return { success: true, action: 'uploadFile' }
    } catch (error) {
      console.error('Upload file error:', error)
      return fail(500, { message: 'Failed to upload file' })
    }
  },

  createSession: async ({ request, locals: { supabase, user }, params }) => {
    if (!user) {
      return fail(401, { message: 'Unauthorized' })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const scheduledAt = formData.get('scheduled_at') as string
    const durationMinutes = parseInt(formData.get('duration_minutes') as string) || 60
    const meetingUrl = formData.get('meeting_url') as string
    const timezone = formData.get('timezone') as string || 'UTC'

    if (!title || !scheduledAt) {
      return fail(400, { message: 'Title and scheduled time are required' })
    }

    try {
      // Verify user is the mentor
      const { data: mentorship } = await supabase
        .from('mentorships')
        .select('mentor_id')
        .eq('id', params.mentorshipId)
        .single()

      if (mentorship?.mentor_id !== user.id) {
        return fail(403, { message: 'Only mentors can create sessions' })
      }

      // Create the session
      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          mentorship_id: params.mentorshipId,
          title,
          description,
          scheduled_at: scheduledAt,
          duration_minutes: durationMinutes,
          meeting_url: meetingUrl,
          timezone,
          status: 'pending'
        })

      if (sessionError) {
        console.error('Create session error:', sessionError)
        throw sessionError
      }

      // Update mentorship's next session if this is the earliest upcoming session
      const { data: nextSession } = await supabase
        .from('sessions')
        .select('scheduled_at')
        .eq('mentorship_id', params.mentorshipId)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single()

      if (nextSession) {
        await supabase
          .from('mentorships')
          .update({ next_session_at: nextSession.scheduled_at })
          .eq('id', params.mentorshipId)
      }

      return { success: true, action: 'createSession' }
    } catch (error) {
      console.error('Create session error:', error)
      return fail(500, { message: 'Failed to create session' })
    }
  }
}

