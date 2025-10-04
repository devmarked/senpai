<script lang="ts">
  import type { PageData } from './$types'
  import SessionsTable from '$lib/components/SessionsTable.svelte'
  import ActivityStats from '$lib/components/ActivityStats.svelte'
  import RecentQnA from '$lib/components/RecentQnA.svelte'
  import MessagesTab from '$lib/components/MessagesTab.svelte'
  import QnAForumTab from '$lib/components/QnAForumTab.svelte'
  import FilesTab from '$lib/components/FilesTab.svelte'
  import senpAILogo from '$lib/assets/senpAI.png'

  let { data } = $props<{ data: PageData }>()
  let { mentorship, qnaPosts, files, nextSession, messages: initialMessages, threadId, isMentor, supabase, sessions } = $derived(data)
  
  let activeTab = $state(data.activeTab || 'overview')
  
  // Get the other person in the mentorship
  const otherPerson = $derived(isMentor ? mentorship.mentee : mentorship.mentor)
  const otherPersonId = $derived(isMentor ? mentorship.mentee_id : mentorship.mentor_id)
</script>

<div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style="background-color: #f9f1dd;">
  <div class="max-w-7xl mx-auto">
    
    <!-- Header with Back Button -->
    <div class="mb-8">
      <a 
        href={isMentor ? "/account/mentor" : "/account"} 
        class="inline-flex items-center text-gray-700 hover:text-gray-900 font-bold mb-4 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        {isMentor ? 'Back to Mentees' : 'Back to Dashboard'}
      </a>
      
      <div class="flex items-start gap-4">
        <img 
          src={senpAILogo}
          alt="SenpAI Logo"
          class="w-20 h-20"
        />
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold text-gray-900">
              {isMentor ? 'Mentoring' : 'Your Mentor:'}
            </h1>
            <img 
              src={otherPerson?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherPerson?.full_name || 'User')}`}
              alt={otherPerson?.full_name || 'User'}
              class="w-10 h-10 rounded-full border-2 border-gray-900 object-cover"
            />
            <h1 class="text-3xl font-bold text-gray-900">
              {otherPerson?.full_name?.split(' ')[0] || (isMentor ? 'mentee' : 'mentor')}
            </h1>
          </div>
          {#if mentorship.goals}
            <p class="mt-2 text-sm text-gray-600">{mentorship.goals}</p>
          {/if}
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="bg-white rounded-3xl border-2 border-gray-900 mb-6 overflow-hidden">
      <div class="flex">
        <button 
          onclick={() => activeTab = 'overview'}
          class="flex-1 px-6 py-4 font-bold text-sm uppercase tracking-wide transition-colors {activeTab === 'overview' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}"
        >
          Overview
        </button>
        <button 
          onclick={() => activeTab = 'messages'}
          class="flex-1 px-6 py-4 font-bold text-sm uppercase tracking-wide transition-colors border-l-2 border-gray-900 {activeTab === 'messages' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}"
        >
          Messages
        </button>
        <button 
          onclick={() => activeTab = 'qna'}
          class="flex-1 px-6 py-4 font-bold text-sm uppercase tracking-wide transition-colors border-l-2 border-gray-900 {activeTab === 'qna' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}"
        >
          Q&A Forum
        </button>
        <button 
          onclick={() => activeTab = 'files'}
          class="flex-1 px-6 py-4 font-bold text-sm uppercase tracking-wide transition-colors border-l-2 border-gray-900 {activeTab === 'files' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}"
        >
          Files
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="space-y-6">
      
      <!-- Overview Tab -->
      {#if activeTab === 'overview'}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Sessions Table -->
          <SessionsTable sessions={data.sessions || []} isMentor={isMentor} />

          <!-- Quick Stats -->
          <ActivityStats mentorship={mentorship} filesCount={files.length} />

          <!-- Recent Q&A -->
          <RecentQnA qnaPosts={qnaPosts} onViewAll={() => activeTab = 'qna'} />
        </div>
      {/if}

      <!-- Messages Tab -->
      {#if activeTab === 'messages'}
        <MessagesTab 
          initialMessages={initialMessages}
          threadId={threadId}
          otherPerson={otherPerson}
          otherPersonId={otherPersonId}
          currentUser={data.user}
          mentorshipId={mentorship.id}
          supabase={supabase}
        />
      {/if}

      <!-- Q&A Forum Tab -->
      {#if activeTab === 'qna'}
        <QnAForumTab qnaPosts={qnaPosts} />
      {/if}

      <!-- Files Tab -->
      {#if activeTab === 'files'}
        <FilesTab files={files} />
      {/if}
    </div>
  </div>
</div>

