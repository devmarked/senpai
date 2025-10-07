<script lang="ts">
  import type { PageData } from './$types'

  let { data } = $props<{ data: PageData }>()
  let { profile, mentorships, sessions, stats } = $derived(data)

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    })
  }

  function getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  function getStatusColor(status: string): string {
    switch(status) {
      case 'active': return 'bg-green-500'
      case 'paused': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }
</script>

<div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style="background-color: #f9f1dd;">
  <div class="max-w-7xl mx-auto">
    
    <!-- Header -->
    <div class="mb-12">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">
            Mentor Dashboard 🎯
          </h1>
          <p class="mt-2 text-gray-700 font-medium">Manage your mentees and mentorships</p>
        </div>
        <div class="flex gap-3">
          <a 
            href="/account" 
            class="inline-flex items-center px-6 py-3 border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-gray-900 p-6">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900">{mentorships.length}</div>
          <div class="text-xs font-bold text-gray-700 uppercase tracking-wide mt-2">Active Mentees</div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-gray-900 p-6">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900">{sessions.length}</div>
          <div class="text-xs font-bold text-gray-700 uppercase tracking-wide mt-2">Total Sessions</div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-gray-900 p-6">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900">
            {mentorships.reduce((sum: number, m: any) => sum + (m.unread_messages || 0), 0)}
          </div>
          <div class="text-xs font-bold text-gray-700 uppercase tracking-wide mt-2">Unread Messages</div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-6">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900">
            {mentorships.filter((m: any) => m.next_session).length}
          </div>
          <div class="text-xs font-bold text-gray-700 uppercase tracking-wide mt-2">Upcoming Sessions</div>
        </div>
      </div>
    </div>

    <!-- My Mentees Section -->
    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div class="px-8 py-6 border-b-2 border-gray-900 bg-white/60">
        <h2 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">My Mentees</h2>
        <p class="text-sm text-gray-700 font-medium mt-1">Active mentorship relationships</p>
      </div>
      
      {#if mentorships && mentorships.length > 0}
        <div class="divide-y-2 divide-gray-900/20">
          {#each mentorships as mentorship}
            <div class="px-8 py-6 hover:bg-white/40 transition-colors">
              <div class="flex items-start gap-4">
                <a href="/account/mentorships/{mentorship.id}">
                  <img 
                    src={mentorship.mentee?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(mentorship.mentee?.full_name || 'Mentee')}`}
                    alt={mentorship.mentee?.full_name || 'Mentee'}
                    class="w-16 h-16 rounded-full border-2 border-gray-900 object-cover hover:scale-105 transition-transform"
                  />
                </a>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <a href="/account/mentorships/{mentorship.id}" class="text-lg font-bold text-gray-900 hover:text-red-500 transition-colors">
                        {mentorship.mentee?.full_name || 'Unknown Mentee'}
                      </a>
                      <p class="text-sm text-gray-700 font-medium mt-1">
                        {`Mentoring ${mentorship.mentee?.full_name?.split(' ')[0] || 'mentee'}`}
                      </p>
                      <p class="text-xs text-gray-600 mt-1">
                        Last interaction: {getTimeAgo(mentorship.last_interaction_at || mentorship.created_at)}
                      </p>
                    </div>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white border-2 border-gray-900 {getStatusColor(mentorship.status)}">
                      {mentorship.status}
                    </span>
                  </div>

                  <!-- Mentorship Stats Mini -->
                  <div class="flex gap-4 mb-3 text-xs text-gray-700 font-medium">
                    {#if mentorship.subscription?.status === 'active'}
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Subscribed
                      </span>
                    {/if}
                    {#if mentorship.unread_messages > 0}
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {mentorship.unread_messages} unread
                      </span>
                    {/if}
                    {#if mentorship.next_session}
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Next: {formatDate(mentorship.next_session.scheduled_at)}
                      </span>
                    {/if}
                  </div>
                  
                  <!-- Action Buttons -->
                  <div class="flex gap-3">
                    <a 
                      href="/account/mentorships/{mentorship.id}"
                      class="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gray-900 border-2 border-gray-900 rounded-full text-white font-bold text-sm hover:bg-red-500 hover:border-red-500 transition-all duration-200"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Open Mentorship Hub
                    </a>
                    <a 
                      href="/account/mentorships/{mentorship.id}?tab=messages"
                      class="inline-flex items-center justify-center px-4 py-2.5 bg-white border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
                    >
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Message
                    </a>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="px-8 py-16 text-center">
          <svg class="mx-auto h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="mt-4 text-xl font-bold text-gray-900">No Active Mentees Yet</h3>
          <p class="mt-2 text-sm text-gray-700 font-medium max-w-sm mx-auto">
            When users subscribe to your mentorship, they'll appear here
          </p>
          <div class="mt-8">
            <a
              href="/mentors/{profile?.slug}"
              target="_blank"
              class="inline-flex items-center px-8 py-3 border-2 border-gray-900 rounded-full text-gray-900 font-bold text-base hover:bg-gray-900 hover:text-white transition-all duration-200"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View My Public Profile
            </a>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

