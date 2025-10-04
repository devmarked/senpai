<script lang="ts">
  import { enhance } from '$app/forms'
  
  type Session = {
    id: string
    title?: string | null
    description?: string | null
    scheduled_at: string | null
    meeting_url?: string | null
    status?: string | null
    duration_minutes?: number | null
    session_type?: string | null
    timezone?: string | null
    mentor_notes?: string | null
    mentorship_id?: string | null
    created_at?: string | null
    updated_at?: string | null
    completed_at?: string | null
  }
  
  let { 
    sessions = [],
    isMentor = false
  }: { 
    sessions?: Session[]
    isMentor?: boolean
  } = $props()
  
  let showCreateSessionModal = $state(false)
  let newSessionTitle = $state('')
  let newSessionDescription = $state('')
  let newSessionDate = $state('')
  let newSessionTime = $state('')
  let newSessionDuration = $state('60')
  let newSessionMeetingUrl = $state('')
  let newSessionTimezone = $state('UTC')
  
  function formatDate(dateString: string | null): string {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  function formatTime(dateString: string | null): string {
    if (!dateString) return 'No time'
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit'
    })
  }

  function getSessionStatus(session: Session): string {
    if (!session.scheduled_at) return session.status || 'Scheduled'
    
    const now = new Date()
    const sessionTime = new Date(session.scheduled_at)
    
    if (sessionTime < now) {
      return 'Completed'
    } else if (session.status === 'confirmed') {
      return 'Confirmed'
    } else if (session.status === 'pending') {
      return 'Pending'
    } else {
      return session.status || 'Scheduled'
    }
  }

  function getSessionStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-gray-500'
      case 'confirmed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-blue-500'
    }
  }
</script>

<div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-gray-900 p-8">
  <div class="flex items-center justify-between mb-6">
    <h2 class="text-xl font-bold text-gray-900 uppercase tracking-wide">Sessions</h2>
    {#if isMentor}
      <button
        onclick={() => showCreateSessionModal = true}
        class="px-4 py-2 bg-gray-900 border-2 border-gray-900 rounded-full text-white font-bold text-sm hover:bg-red-500 hover:border-red-500 transition-all duration-200"
      >
        + Create Session
      </button>
    {/if}
  </div>
  {#if sessions && Array.isArray(sessions) && sessions.length > 0}
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b-2 border-gray-900">
            <th class="text-left py-3 px-4 font-bold text-gray-900 uppercase text-sm">Session</th>
            <th class="text-left py-3 px-4 font-bold text-gray-900 uppercase text-sm">Link</th>
            <th class="text-left py-3 px-4 font-bold text-gray-900 uppercase text-sm">Date</th>
            <th class="text-left py-3 px-4 font-bold text-gray-900 uppercase text-sm">Time</th>
            <th class="text-left py-3 px-4 font-bold text-gray-900 uppercase text-sm">Status</th>
          </tr>
        </thead>
        <tbody>
          {#each sessions as session, index}
            <tr class="border-b border-gray-900/20 hover:bg-white/40 transition-colors">
              <td class="py-4 px-4">
                <div class="font-bold text-gray-900">
                  Session #{index + 1}
                </div>
                {#if session.title}
                  <div class="text-sm text-gray-600">{session.title}</div>
                {/if}
              </td>
              <td class="py-4 px-4">
                {#if session.meeting_url}
                  <a 
                    href={session.meeting_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-block px-3 py-1 bg-gray-900 border-2 border-gray-900 rounded-full text-white text-xs font-bold hover:bg-red-500 hover:border-red-500 transition-all duration-200"
                  >
                    Join →
                  </a>
                {:else}
                  <span class="text-gray-500 text-sm">No link</span>
                {/if}
              </td>
              <td class="py-4 px-4 font-medium text-gray-900">
                {formatDate(session.scheduled_at)}
              </td>
              <td class="py-4 px-4 font-medium text-gray-900">
                {formatTime(session.scheduled_at)}
              </td>
              <td class="py-4 px-4">
                {#if true}
                  {@const status = getSessionStatus(session)}
                  {@const statusColor = getSessionStatusColor(status)}
                  <span class="px-3 py-1 rounded-full text-xs font-bold text-white border-2 border-gray-900 {statusColor}">
                    {status}
                  </span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="text-center py-12">
      <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p class="text-gray-700 font-medium">No sessions scheduled</p>
      <p class="text-sm text-gray-600 mt-2">Sessions will appear here once they're booked</p>
    </div>
  {/if}
</div>

<!-- Create Session Modal -->
{#if showCreateSessionModal}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" 
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    onclick={(e) => {
      if (e.target === e.currentTarget) showCreateSessionModal = false
    }}
    onkeydown={(e) => {
      if (e.key === 'Escape') showCreateSessionModal = false
    }}
  >
    <div class="bg-white rounded-3xl border-4 border-gray-900 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
      <div class="flex items-center justify-between mb-6">
        <h2 id="modal-title" class="text-2xl font-bold text-gray-900 uppercase tracking-wide">Create New Session</h2>
        <button
          type="button"
          onclick={() => showCreateSessionModal = false}
          aria-label="Close modal"
          class="text-gray-900 hover:text-red-500 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form method="POST" action="?/createSession" use:enhance={async () => {
        return async ({ result, update }) => {
          if (result.type === 'success') {
            showCreateSessionModal = false
            newSessionTitle = ''
            newSessionDescription = ''
            newSessionDate = ''
            newSessionTime = ''
            newSessionDuration = '60'
            newSessionMeetingUrl = ''
            newSessionTimezone = 'UTC'
            await update()
          } else {
            await update()
          }
        }
      }} class="space-y-4">
        
        <div>
          <label for="session_title" class="block text-sm font-bold text-gray-900 mb-2">
            Session Title *
          </label>
          <input
            id="session_title"
            type="text"
            name="title"
            bind:value={newSessionTitle}
            placeholder="e.g., Weekly Check-in, Project Review"
            class="w-full rounded-2xl border-2 border-gray-900 bg-white px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            required
          />
        </div>

        <div>
          <label for="session_description" class="block text-sm font-bold text-gray-900 mb-2">
            Description
          </label>
          <textarea
            id="session_description"
            name="description"
            bind:value={newSessionDescription}
            rows="3"
            placeholder="What will you cover in this session?"
            class="w-full rounded-2xl border-2 border-gray-900 bg-white px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="session_date" class="block text-sm font-bold text-gray-900 mb-2">
              Date *
            </label>
            <input
              id="session_date"
              type="date"
              bind:value={newSessionDate}
              class="w-full rounded-2xl border-2 border-gray-900 bg-white px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label for="session_time" class="block text-sm font-bold text-gray-900 mb-2">
              Time *
            </label>
            <input
              id="session_time"
              type="time"
              bind:value={newSessionTime}
              class="w-full rounded-2xl border-2 border-gray-900 bg-white px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
        </div>

        <input 
          type="hidden" 
          name="scheduled_at" 
          value={newSessionDate && newSessionTime ? `${newSessionDate}T${newSessionTime}:00` : ''} 
        />

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="session_duration" class="block text-sm font-bold text-gray-900 mb-2">
              Duration (minutes)
            </label>
            <input
              id="session_duration"
              type="number"
              name="duration_minutes"
              bind:value={newSessionDuration}
              min="15"
              max="240"
              step="15"
              class="w-full rounded-2xl border-2 border-gray-900 bg-white px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label for="session_timezone" class="block text-sm font-bold text-gray-900 mb-2">
              Timezone
            </label>
            <select
              id="session_timezone"
              name="timezone"
              bind:value={newSessionTimezone}
              class="w-full rounded-2xl border-2 border-gray-900 bg-white px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>
        </div>

        <div>
          <label for="session_meeting_url" class="block text-sm font-bold text-gray-900 mb-2">
            Meeting URL
          </label>
          <input
            id="session_meeting_url"
            type="url"
            name="meeting_url"
            bind:value={newSessionMeetingUrl}
            placeholder="https://meet.google.com/... or https://zoom.us/..."
            class="w-full rounded-2xl border-2 border-gray-900 bg-white px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <p class="text-xs text-gray-600 mt-1">
            Add your Google Meet, Zoom, or other video call link
          </p>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            onclick={() => showCreateSessionModal = false}
            class="flex-1 py-3 bg-white border-2 border-gray-900 rounded-full text-gray-900 font-bold hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 py-3 bg-gray-900 border-2 border-gray-900 rounded-full text-white font-bold hover:bg-red-500 hover:border-red-500 transition-all duration-200"
          >
            Create Session
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

