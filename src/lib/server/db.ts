// src/lib/server/db.ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Tables } from '$lib/types/database.types'

/**
 * Get a user's profile from the database
 */
export async function getProfile(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

/**
 * Update a user's profile
 */
export async function updateProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: Partial<Tables<'profiles'>>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get all mentors with optional filters
 */
export async function getMentors(
  supabase: SupabaseClient<Database>,
  filters?: {
    topics?: string[]
    experienceLevel?: string
    isAvailable?: boolean
    search?: string
  }
) {
  let query = supabase
    .from('profiles')
    .select('*')
    .in('role', ['mentor', 'both'])

  if (filters?.topics && filters.topics.length > 0) {
    query = query.overlaps('topics', filters.topics)
  }

  if (filters?.experienceLevel) {
    query = query.eq('experience_level', filters.experienceLevel)
  }

  if (filters?.isAvailable !== undefined) {
    query = query.eq('is_available', filters.isAvailable)
  }

  if (filters?.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`)
  }

  const { data, error } = await query.order('average_rating', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Get a mentor by slug
 */
export async function getMentorBySlug(supabase: SupabaseClient<Database>, slug: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('slug', slug)
    .in('role', ['mentor', 'both'])
    .single()

  if (error) throw error
  return data
}

/**
 * Get sessions for a user (through their mentorships)
 */
export async function getUserSessions(
  supabase: SupabaseClient<Database>,
  userId: string,
  type: 'mentor' | 'mentee' = 'mentee'
) {
  const column = type === 'mentor' ? 'mentor_id' : 'mentee_id'

  // First get user's mentorships
  const { data: mentorships, error: mentorshipError } = await supabase
    .from('mentorships')
    .select('id, mentor_id, mentee_id, mentor:mentor_id(full_name, avatar_url, slug), mentee:mentee_id(full_name, avatar_url, slug)')
    .eq(column, userId)

  if (mentorshipError) throw mentorshipError
  if (!mentorships || mentorships.length === 0) return []

  const mentorshipIds = mentorships.map(m => m.id)

  // Get sessions for these mentorships
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      mentorship:mentorship_id(
        id,
        mentor:mentor_id(full_name, avatar_url, slug),
        mentee:mentee_id(full_name, avatar_url, slug)
      )
    `)
    .in('mentorship_id', mentorshipIds)
    .order('scheduled_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get messages for a thread
 */
export async function getThreadMessages(
  supabase: SupabaseClient<Database>,
  threadId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(full_name, avatar_url),
      recipient:recipient_id(full_name, avatar_url)
    `)
    .eq('thread_id', threadId)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(
  supabase: SupabaseClient<Database>,
  threadId: string,
  userId: string
) {
  const { error } = await supabase
    .from('messages')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('thread_id', threadId)
    .eq('recipient_id', userId)
    .eq('is_read', false)

  if (error) throw error
}

/**
 * Get reviews for a mentor
 */
export async function getMentorReviews(
  supabase: SupabaseClient<Database>,
  mentorId: string
) {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      mentee:profiles!reviews_mentee_id_fkey(full_name, avatar_url)
    `)
    .eq('mentor_id', mentorId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}


/**
 * Generate a slug for a mentor profile
 */
export async function generateSlug(
  supabase: SupabaseClient<Database>,
  name: string,
  userId: string
) {
  const { data, error } = await supabase.rpc('generate_slug', {
    name,
    user_id: userId
  })

  if (error) throw error
  return data
}

/**
 * Get dashboard statistics for a user
 */
export async function getDashboardStats(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  // Get user's mentorships as mentee
  const { data: menteeMentorships } = await supabase
    .from('mentorships')
    .select('id, mentor_id')
    .eq('mentee_id', userId)

  const mentorshipIds = menteeMentorships?.map(m => m.id) || []
  const uniqueMentors = new Set(menteeMentorships?.map(m => m.mentor_id) || []).size

  if (mentorshipIds.length === 0) {
    return {
      totalSessions: 0,
      upcomingSessions: 0,
      unreadMessages: 0,
      totalMentors: 0
    }
  }

  // Get total sessions as mentee
  const { count: totalSessions } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .in('mentorship_id', mentorshipIds)
    .in('status', ['confirmed', 'completed'])

  // Get upcoming sessions count
  const now = new Date().toISOString()
  const { count: upcomingSessions } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .in('mentorship_id', mentorshipIds)
    .eq('status', 'confirmed')
    .gte('scheduled_at', now)

  // Get unread messages count
  const { count: unreadMessages } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('is_read', false)

  return {
    totalSessions: totalSessions || 0,
    upcomingSessions: upcomingSessions || 0,
    unreadMessages: unreadMessages || 0,
    totalMentors: uniqueMentors
  }
}

/**
 * Get upcoming sessions for dashboard (limited to next few)
 */
export async function getUpcomingSessions(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 5
) {
  const now = new Date().toISOString()
  
  // Get user's mentorships as mentee
  const { data: menteeMentorships } = await supabase
    .from('mentorships')
    .select('id')
    .eq('mentee_id', userId)

  const mentorshipIds = menteeMentorships?.map(m => m.id) || []
  
  if (mentorshipIds.length === 0) return []

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      mentorship:mentorship_id(
        mentor:mentor_id(full_name, avatar_url, slug)
      )
    `)
    .in('mentorship_id', mentorshipIds)
    .eq('status', 'confirmed')
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data || []
}

/**
 * Get recent message threads for a user
 */
export async function getRecentThreads(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 5
) {
  // Get recent messages with sender/recipient info
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(full_name, avatar_url),
      recipient:recipient_id(full_name, avatar_url)
    `)
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(limit * 3) // Get more to filter unique threads

  if (error) throw error

  // Get unique threads (most recent message per thread)
  const threadMap = new Map()
  data?.forEach((msg) => {
    if (!threadMap.has(msg.thread_id)) {
      threadMap.set(msg.thread_id, msg)
    }
  })

  return Array.from(threadMap.values()).slice(0, limit)
}

/**
 * Get active subscriptions for a user
 */
export async function getActiveSubscriptions(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      mentor:mentor_id(full_name, avatar_url, slug),
      mentorship:mentorships(id, title, goals, status)
    `)
    .eq('mentee_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active subscriptions:', error)
    throw error
  }
  
  console.log('Fetched subscriptions:', data?.map(s => ({
    id: s.id,
    has_mentorship: !!s.mentorship,
    mentorship_id: (s.mentorship as any)?.id
  })))
  
  return data || []
}

/**
 * Get mentorships for a mentor
 */
export async function getMentorMentorships(
  supabase: SupabaseClient<Database>,
  mentorId: string
) {
  const { data, error } = await supabase
    .from('mentorships')
    .select(`
      *,
      mentee:profiles!mentorships_mentee_id_fkey(id, full_name, avatar_url, email, slug),
      subscription:subscriptions!mentorships_subscription_id_fkey(*)
    `)
    .eq('mentor_id', mentorId)
    .order('last_interaction_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get mentorships for a mentee
 */
export async function getMenteeMentorships(
  supabase: SupabaseClient<Database>,
  menteeId: string
) {
  const { data, error } = await supabase
    .from('mentorships')
    .select(`
      *,
      mentor:profiles!mentorships_mentor_id_fkey(id, full_name, avatar_url, email, slug),
      subscription:subscriptions!mentorships_subscription_id_fkey(*)
    `)
    .eq('mentee_id', menteeId)
    .order('last_interaction_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get a specific mentorship by ID
 */
export async function getMentorshipById(
  supabase: SupabaseClient<Database>,
  mentorshipId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from('mentorships')
    .select(`
      *,
      mentor:profiles!mentorships_mentor_id_fkey(id, full_name, avatar_url, email, slug),
      mentee:profiles!mentorships_mentee_id_fkey(id, full_name, avatar_url, email, slug),
      subscription:subscriptions!mentorships_subscription_id_fkey(*)
    `)
    .eq('id', mentorshipId)
    .or(`mentor_id.eq.${userId},mentee_id.eq.${userId}`)
    .single()

  if (error) throw error
  return data
}

/**
 * Create or get mentorship from subscription
 */
export async function getOrCreateMentorship(
  supabase: SupabaseClient<Database>,
  subscriptionId: string
) {
  // First check if mentorship already exists
  const { data: existing } = await supabase
    .from('mentorships')
    .select('*')
    .eq('subscription_id', subscriptionId)
    .single()

  if (existing) return existing

  // Get subscription details
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single()

  if (!subscription) throw new Error('Subscription not found')

  // Create new mentorship
  const { data, error } = await supabase
    .from('mentorships')
    .insert({
      subscription_id: subscriptionId,
      mentor_id: subscription.mentor_id,
      mentee_id: subscription.mentee_id,
      status: 'active',
      title: 'Mentorship Program'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update mentorship details
 */
export async function updateMentorship(
  supabase: SupabaseClient<Database>,
  mentorshipId: string,
  updates: {
    title?: string
    goals?: string
    next_session_at?: string
    status?: string
    notes?: any
  }
) {
  const { data, error } = await supabase
    .from('mentorships')
    .update(updates)
    .eq('id', mentorshipId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get QnA posts for a mentorship
 */
export async function getMentorshipQnAPosts(
  supabase: SupabaseClient<Database>,
  mentorshipId: string
) {
  const { data, error } = await supabase
    .from('mentorship_qna_posts')
    .select(`
      *,
      author:profiles!mentorship_qna_posts_author_id_fkey(id, full_name, avatar_url, role),
      replies:mentorship_qna_replies(
        *,
        author:profiles!mentorship_qna_replies_author_id_fkey(id, full_name, avatar_url, role)
      )
    `)
    .eq('mentorship_id', mentorshipId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create QnA post
 */
export async function createQnAPost(
  supabase: SupabaseClient<Database>,
  mentorshipId: string,
  authorId: string,
  data: {
    title: string
    content: string
    post_type?: string
    is_pinned?: boolean
  }
) {
  const { data: post, error } = await supabase
    .from('mentorship_qna_posts')
    .insert({
      mentorship_id: mentorshipId,
      author_id: authorId,
      ...data
    })
    .select(`
      *,
      author:profiles!mentorship_qna_posts_author_id_fkey(id, full_name, avatar_url, role)
    `)
    .single()

  if (error) throw error

  // Update mentorship last interaction and QnA count
// Line 513-519
await supabase
  .from('mentorships')
  .update({
    last_interaction_at: new Date().toISOString()
  })
  .eq('id', mentorshipId)

  return post
}

/**
 * Create QnA reply
 */
export async function createQnAReply(
  supabase: SupabaseClient<Database>,
  postId: string,
  authorId: string,
  content: string,
  isAcceptedAnswer: boolean = false
) {
  const { data, error } = await supabase
    .from('mentorship_qna_replies')
    .insert({
      post_id: postId,
      author_id: authorId,
      content,
      is_accepted_answer: isAcceptedAnswer
    })
    .select(`
      *,
      author:profiles!mentorship_qna_replies_author_id_fkey(id, full_name, avatar_url, role)
    `)
    .single()

  if (error) throw error

  // If this is accepted answer, mark post as answered
  if (isAcceptedAnswer) {
    await supabase
      .from('mentorship_qna_posts')
      .update({ is_answered: true })
      .eq('id', postId)
  }

  return data
}

/**
 * Get mentorship files
 */
export async function getMentorshipFiles(
  supabase: SupabaseClient<Database>,
  mentorshipId: string
) {
  const { data, error } = await supabase
    .from('mentorship_files')
    .select(`
      *,
      uploader:profiles!mentorship_files_uploaded_by_fkey(id, full_name, avatar_url)
    `)
    .eq('mentorship_id', mentorshipId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Create file metadata entry
 */
export async function createMentorshipFile(
  supabase: SupabaseClient<Database>,
  mentorshipId: string,
  uploadedBy: string,
  fileData: {
    filename: string
    file_size: number
    file_type: string
    storage_path: string
    storage_url: string
    description?: string
  }
) {
  const { data, error } = await supabase
    .from('mentorship_files')
    .insert({
      mentorship_id: mentorshipId,
      uploaded_by: uploadedBy,
      ...fileData
    })
    .select(`
      *,
      uploader:profiles!mentorship_files_uploaded_by_fkey(id, full_name, avatar_url)
    `)
    .single()

  if (error) throw error

  // Update mentorship stats
  await supabase
    .from('mentorships')
    .update({
      last_interaction_at: new Date().toISOString()
    })
    .eq('id', mentorshipId)

  return data
}

/**
 * Get next session for a mentorship
 */
export async function getNextMentorshipSession(
  supabase: SupabaseClient<Database>,
  mentorshipId: string
) {
  const now = new Date().toISOString()
  
  // First try to get confirmed sessions
  const { data: confirmedSession, error: confirmedError } = await supabase
    .from('sessions')
    .select('*')
    .eq('mentorship_id', mentorshipId)
    .eq('status', 'confirmed')
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single()

  if (confirmedSession) return confirmedSession

  // If no confirmed session, try to get any upcoming session (pending, etc.)
  const { data: anySession, error: anyError } = await supabase
    .from('sessions')
    .select('*')
    .eq('mentorship_id', mentorshipId)
    .in('status', ['pending', 'confirmed', 'scheduled'])
    .gte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single()

  if (anyError && anyError.code !== 'PGRST116') throw anyError
  return anySession || null
}

