<script lang="ts">
  import { enhance } from '$app/forms'
  import { onMount, tick } from 'svelte'
  import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
  
  type Message = {
    id: string
    thread_id: string
    sender_id: string
    recipient_id: string
    content: string
    created_at: string
    sender?: {
      id: string
      full_name: string
      avatar_url: string | null
    }
    is_read: boolean
    read_at: string | null
    attachments: any[]
    updated_at: string
    session_id: string | null
    mentorship_id: string
  }
  
  type User = {
    id: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
  
  type OtherPerson = {
    full_name: string
    avatar_url?: string
  }
  
  let { 
    initialMessages = [],
    threadId,
    otherPerson,
    otherPersonId,
    currentUser,
    mentorshipId,
    supabase
  }: { 
    initialMessages: Message[]
    threadId: string
    otherPerson: OtherPerson
    otherPersonId: string
    currentUser: User
    mentorshipId: string
    supabase: SupabaseClient
  } = $props()
  
  let newMessage = $state('')
  let messages = $state<Message[]>([])
  let messagesContainer = $state<HTMLDivElement | null>(null)
  let realtimeChannel: RealtimeChannel | null = null
  
  // Scroll to bottom of messages
  async function scrollToBottom() {
    await tick()
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }

  // Set up Supabase Realtime subscription
  onMount(() => {
    // Subscribe to new messages in this thread
    realtimeChannel = supabase
      .channel(`messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`
        },
        async (payload: any) => {
          console.log('New message received:', payload)
          
          // Fetch the full message with sender details
          const { data: newMessage, error } = await supabase
            .from('messages')
            .select(`
              *,
              sender:sender_id (
                id,
                full_name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single()

          if (!error && newMessage) {
            // Only add if not already in the list (avoid duplicates)
            if (!messages.find((m: Message) => m.id === newMessage.id)) {
              messages = [...messages, newMessage]
              scrollToBottom()
            }
          }
        }
      )
      .subscribe()

    // Initial scroll to bottom
    scrollToBottom()

    // Cleanup subscription on unmount
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel)
      }
    }
  })

  // Update messages when data changes
  $effect(() => {
    if (initialMessages) {
      messages = initialMessages
      scrollToBottom()
    }
  })
</script>

<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 overflow-hidden">
  <div class="px-8 py-6 border-b-2 border-gray-900 bg-white/60">
    <h2 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">Direct Messages</h2>
    <p class="text-sm text-gray-700 font-medium mt-1">Private conversation with {otherPerson.full_name}</p>
  </div>
  
  <!-- Messages List -->
  <div bind:this={messagesContainer} class="p-6 space-y-4 max-h-[500px] overflow-y-auto bg-white/30">
    {#if messages && messages.length > 0}
      {#each messages as message (message.id)}
        <div class="flex {message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}">
          <div class="max-w-[70%]">
            <div class="flex items-start gap-2 {message.sender_id === currentUser.id ? 'flex-row-reverse' : ''}">
              <img 
                src={message.sender?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.sender?.full_name || 'User')}`}
                alt={message.sender?.full_name || 'User'}
                class="w-8 h-8 rounded-full border-2 border-gray-900 object-cover"
              />
              <div>
                <div class="bg-white rounded-2xl border-2 border-gray-900 px-4 py-3 {message.sender_id === currentUser.id ? 'bg-gray-900' : ''}">
                  <p class="text-sm font-medium">{message.content}</p>
                </div>
                <p class="text-xs text-gray-600 mt-1 px-2">
                  {new Date(message.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      {/each}
    {:else}
      <div class="text-center py-12">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <p class="text-gray-700 font-medium">No messages yet. Start the conversation!</p>
      </div>
    {/if}
  </div>

  <!-- Message Input -->
  <div class="px-8 py-6 border-t-2 border-gray-900 bg-white/60">
    <form method="POST" action="?/sendMessage" use:enhance={async ({ formData }) => {
      const content = formData.get('content') as string
      if (!content.trim()) return
      
      // Optimistic UI: Add message immediately
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        thread_id: threadId,
        sender_id: currentUser.id,
        recipient_id: otherPersonId,
        content: content,
        created_at: new Date().toISOString(),
        sender: {
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || 'You',
          avatar_url: currentUser.user_metadata?.avatar_url || null
        },
        is_read: false,
        read_at: null,
        attachments: [],
        updated_at: new Date().toISOString(),
        session_id: null,
        mentorship_id: mentorshipId
      }
      
      messages = [...messages, optimisticMessage]
      newMessage = ''
      scrollToBottom()
      
      return async ({ result, update }) => {
        if (result.type === 'success') {
          // Remove optimistic message since realtime will add the real one
          messages = messages.filter((m: Message) => m.id !== optimisticMessage.id)
          await update()
        } else {
          // Revert on error
          messages = messages.filter((m: Message) => m.id !== optimisticMessage.id)
          await update()
        }
      }
    }}>
      <input type="hidden" name="thread_id" value={threadId} />
      <input type="hidden" name="recipient_id" value={otherPersonId} />
      <input type="hidden" name="mentorship_id" value={mentorshipId} />
      <div class="flex gap-3">
        <input
          type="text"
          name="content"
          bind:value={newMessage}
          placeholder="Type your message..."
          class="flex-1 rounded-2xl border-2 border-gray-900 bg-white text-gray-900 px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
        <button
          type="submit"
          class="px-8 py-3 bg-gray-900 border-2 border-gray-900 rounded-full text-white font-bold hover:bg-red-500 hover:border-red-500 transition-all duration-200"
        >
          Send
        </button>
      </div>
    </form>
  </div>
</div>

