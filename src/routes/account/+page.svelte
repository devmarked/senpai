<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData } from './$types'

  let { data } = $props<{ data: PageData }>()
  let { user, profile, stats, upcomingSessions, recentThreads, activeSubscriptions } = $derived(data)

  // Modal state
  let showMentorApplicationModal = $state(false)

  // Format date helper
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
</script>

<div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style="background-color: #f9f1dd;">
  <div class="max-w-7xl mx-auto">
    
    <!-- Header -->
    <div class="mb-12">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">
            My Dashboard 🎯
          </h1>
          <p class="mt-2 text-gray-700 font-medium">Manage your mentor subscriptions and upcoming sessions.</p>
        </div>
        <div class="flex gap-3">
          <a 
            href="/account/profile" 
            class="inline-flex items-center px-6 py-3 border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </a>
          <a 
            href="/mentors" 
            class="inline-flex items-center px-6 py-3 border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Find Mentors
          </a>
          <form method="POST" action="?/signout" use:enhance>
            <button
              type="submit"
              class="inline-flex items-center px-6 py-3 border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm bg-white hover:bg-gray-900 hover:text-white transition-all duration-200"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-gray-900 p-6">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900">{activeSubscriptions?.length || 0}</div>
          <div class="text-xs font-bold text-gray-700 uppercase tracking-wide mt-2">Active Mentors</div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-gray-900 p-6">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900">{stats.totalSessions}</div>
          <div class="text-xs font-bold text-gray-700 uppercase tracking-wide mt-2">Total Sessions</div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-gray-900 p-6">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900">{stats.unreadMessages}</div>
          <div class="text-xs font-bold text-gray-700 uppercase tracking-wide mt-2">Unread Messages</div>
        </div>
      </div>
      
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-6">
        <div class="text-center">
          <div class="text-4xl font-bold text-gray-900">{upcomingSessions?.length || 0}</div>
          <div class="text-xs font-bold text-gray-700 uppercase tracking-wide mt-2">Upcoming Sessions</div>
        </div>
      </div>
    </div>

    <!-- Mentor Application CTA (only show if not already a mentor) -->
    {#if profile?.role !== 'mentor' && profile?.role !== 'both'}
      <div class="mb-8 bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl border-2 border-gray-900 hover:shadow-2xl transition-all duration-300 overflow-hidden">
        <div class="px-8 py-8">
          <div class="flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex-1 text-center md:text-left">
              <div class="flex items-center justify-center md:justify-start gap-2 mb-3">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">Become a Mentor!</h2>
              </div>
              <p class="text-base text-gray-700 font-medium">
                We are looking for more Mentors. If you are an expert in the AI field, we want you!
              </p>
            </div>
            <button
              onclick={() => showMentorApplicationModal = true}
              class="inline-flex items-center px-8 py-4 bg-gray-900 border-2 border-gray-900 rounded-full text-white font-bold text-base hover:bg-red-500 hover:border-red-500 transition-all duration-200 hover:scale-105"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Apply Now
            </button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Main Content -->
    <div class="space-y-8">
        
        <!-- My Mentors (Subscriptions) -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <div class="px-8 py-6 border-b-2 border-gray-900 bg-white/60">
            <h2 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">My Mentors</h2>
            <p class="text-sm text-gray-700 font-medium mt-1">Subscribe to message and get guidance</p>
          </div>
          
          {#if activeSubscriptions && activeSubscriptions.length > 0}
            <div class="divide-y-2 divide-gray-900/20">
              {#each activeSubscriptions as subscription}
                <div class="px-8 py-6">
                  <div class="flex items-start gap-4">
                    <a href={subscription.mentorship?.id ? `/account/mentorships/${subscription.mentorship.id}` : `/mentors/${subscription.mentor?.slug}`}>
                      <img 
                        src={subscription.mentor?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(subscription.mentor?.full_name || 'Mentor')}`}
                        alt={subscription.mentor?.full_name || 'Mentor'}
                        class="w-16 h-16 rounded-full border-2 border-gray-900 object-cover hover:scale-105 transition-transform"
                      />
                    </a>
                    <div class="flex-1">
                      <div class="flex items-start justify-between mb-3">
                        <div>
                          <a href={subscription.mentorship?.id ? `/account/mentorships/${subscription.mentorship.id}` : `/mentors/${subscription.mentor?.slug}`} class="text-lg font-bold text-gray-900 hover:text-red-500 transition-colors">
                            {subscription.mentor?.full_name || 'Unknown Mentor'}
                          </a>
                          <p class="text-sm text-gray-700 font-medium mt-1">
                            Subscribed • Active
                          </p>
                        </div>
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white border-2 border-gray-900">
                          Active
                        </span>
                      </div>
                      
                      <!-- Action Buttons -->
                      <div class="flex gap-3">
                        {#if subscription.mentorship?.id}
                          <a 
                            href="/account/mentorships/{subscription.mentorship.id}"
                            class="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gray-900 border-2 border-gray-900 rounded-full text-white font-bold text-sm hover:bg-red-500 hover:border-red-500 transition-all duration-200"
                          >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Open Mentorship Hub
                          </a>
                          <a 
                            href="/account/mentorships/{subscription.mentorship.id}?tab=messages"
                            class="inline-flex items-center justify-center px-4 py-2.5 bg-white border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
                          >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Message
                          </a>
                        {:else}
                          <a 
                            href="/messages?mentor={subscription.mentor_id}"
                            class="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-white border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
                          >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                            Message
                          </a>
                          <a 
                            href="/account/bookings"
                            class="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-white border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
                          >
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            View Sessions
                          </a>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
            <div class="px-8 py-4 bg-white/30 border-t-2 border-gray-900 text-center">
              <a href="/account/subscriptions" class="text-sm text-gray-900 hover:text-red-500 font-bold transition-colors">
                Manage All Subscriptions →
              </a>
            </div>
          {:else}
            <div class="px-8 py-16 text-center">
              <svg class="mx-auto h-20 w-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 class="mt-4 text-xl font-bold text-gray-900">No Active Mentors</h3>
              <p class="mt-2 text-sm text-gray-700 font-medium max-w-sm mx-auto">
                Subscribe to a mentor to unlock messaging, Q&A, and ongoing support
              </p>
              <div class="mt-8">
                <a
                  href="/mentors"
                  class="inline-flex items-center px-8 py-3 border-2 border-gray-900 rounded-full text-gray-900 font-bold text-base hover:bg-gray-900 hover:text-white transition-all duration-200"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Your Mentor
                </a>
              </div>
            </div>
          {/if}
        </div>

        <!-- Upcoming Sessions (if any) -->
        {#if upcomingSessions && upcomingSessions.length > 0}
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-gray-900 hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div class="px-8 py-5 border-b-2 border-gray-900 bg-white/60">
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-900 uppercase tracking-wide">Upcoming Sessions</h2>
                <a href="/account/bookings" class="text-sm text-gray-900 hover:text-red-500 font-bold transition-colors">
                  View all →
                </a>
              </div>
            </div>
            <div class="p-6 space-y-4">
              {#each upcomingSessions as session}
                <div class="bg-white/60 rounded-2xl border-2 border-gray-900 p-5 hover:bg-white transition-colors">
                  <div class="flex items-center gap-4 mb-3">
                    <img 
                      src={session.mentor?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.mentor?.full_name || 'Mentor')}`}
                      alt={session.mentor?.full_name || 'Mentor'}
                      class="w-12 h-12 rounded-full border-2 border-gray-900 object-cover"
                    />
                    <div class="flex-1">
                      <h3 class="text-base font-bold text-gray-900">
                        {session.mentor?.full_name || 'Unknown Mentor'}
                      </h3>
                      <p class="text-sm text-gray-700 font-medium">
                        {formatDate(session.scheduled_at)} at {formatTime(session.scheduled_at)}
                      </p>
                    </div>
                  </div>
                  {#if session.meeting_link}
                    <a 
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="block text-center px-4 py-2.5 bg-transparent border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
                    >
                      Join Meeting →
                    </a>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}

      <!-- Mentor Dashboard Link (if user is a mentor) -->
      {#if profile?.slug && (profile?.role === 'mentor' || profile?.role === 'both')}
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-gray-900 hover:shadow-2xl transition-all duration-300 overflow-hidden">
          <div class="px-8 py-6">
            <div class="flex flex-col md:flex-row items-center justify-between gap-6">
              <div class="flex items-start gap-4">
                <div class="flex-shrink-0 bg-white rounded-full p-3 border-2 border-gray-900">
                  <svg class="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 uppercase tracking-wide">You're a Mentor!</h3>
                  <p class="mt-2 text-sm text-gray-700 font-medium">
                    Manage your mentees, sessions, and view your mentor profile
                  </p>
                </div>
              </div>
              <div class="flex gap-3 flex-shrink-0">
                <a 
                  href="/mentors/{profile.slug}" 
                  target="_blank"
                  class="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Profile
                </a>
                <a 
                  href="/account/mentor"
                  class="inline-flex items-center px-6 py-3 bg-gray-900 border-2 border-gray-900 rounded-full text-white font-bold text-sm hover:bg-red-500 hover:border-red-500 transition-all duration-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Mentor Dashboard
                </a>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<!-- Mentor Application Modal -->
{#if showMentorApplicationModal}
  <div 
    class="fixed inset-0 z-50 overflow-y-auto"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onkeydown={(e) => {
      if (e.key === 'Escape') showMentorApplicationModal = false
    }}
  >
    <!-- Backdrop -->
    <button
      type="button"
      class="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity cursor-default"
      aria-label="Close modal"
      onclick={() => showMentorApplicationModal = false}
    ></button>
    
    <!-- Modal Content -->
    <div class="flex min-h-full items-center justify-center p-4 pointer-events-none">
      <div 
        class="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-4 border-gray-900 shadow-2xl w-full max-w-2xl overflow-hidden pointer-events-auto"
        role="document"
      >
        <!-- Header -->
        <div class="px-8 py-6 border-b-4 border-gray-900 bg-white/60">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">Become a Mentor</h3>
            </div>
            <button
              onclick={() => showMentorApplicationModal = false}
              class="p-2 rounded-full hover:bg-white transition-colors"
              aria-label="Close modal"
            >
              <svg class="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="px-8 py-8">
          <div class="mb-6">
            <h4 class="text-lg font-bold text-gray-900 mb-3">How to Apply</h4>
            <div class="bg-white/60 rounded-2xl border-2 border-gray-900 p-6 mb-6">
              <div class="space-y-4 text-gray-700 font-medium">
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">Send us an email</p>
                    <p class="text-sm">Email us at <strong class="text-gray-900">mentor@senp.ai</strong> with your application</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">Wait for our response</p>
                    <p class="text-sm">We'll review your application and get back to you within 2-3 business days</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <p class="font-bold text-gray-900">Complete your profile</p>
                    <p class="text-sm">Once approved, we'll help you set up your mentor profile and get started</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <h4 class="text-lg font-bold text-gray-900 mb-3">What We're Looking For</h4>
            <ul class="space-y-2 text-gray-700 font-medium">
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Expertise in AI, Machine Learning, Deep Learning, or related fields</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Passion for teaching and helping others grow</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Real-world industry or academic experience</span>
              </li>
              <li class="flex items-start gap-2">
                <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Commitment to mentoring and supporting mentees</span>
              </li>
            </ul>
          </div>

          <div class="bg-red-50 rounded-2xl border-2 border-gray-900 p-4 mb-6">
            <p class="text-sm text-gray-700 font-medium text-center">
              <strong class="text-gray-900">Ready to get started?</strong><br>
              Send us an email at <strong class="text-gray-900">mentor@senp.ai</strong> and we'll get back to you soon!
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              onclick={() => showMentorApplicationModal = false}
              class="flex-1 px-6 py-3.5 border-2 border-gray-900 rounded-full text-gray-900 font-bold text-base bg-white hover:bg-gray-100 transition-all duration-200"
            >
              Close
            </button>
            <a
              href="mailto:mentor@senp.ai?subject=Mentor Application&body=Hi,%0D%0A%0D%0AI'm interested in becoming a mentor on SenpAI. Please let me know the next steps.%0D%0A%0D%0AThanks!"
              class="flex-1 inline-flex items-center justify-center px-6 py-3.5 bg-gray-900 border-2 border-gray-900 rounded-full text-white font-bold text-base hover:bg-red-500 hover:border-red-500 transition-all duration-200 text-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Us Now
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

