<script lang="ts">
  import { enhance } from '$app/forms'
  
  type QnAPost = {
    id: string
    title: string
    content: string
    post_type: string
    is_answered: boolean
    created_at: string
    author?: {
      full_name: string
      avatar_url?: string
    }
    replies?: {
      id: string
      content: string
      is_accepted_answer: boolean
      author?: {
        full_name: string
        avatar_url?: string
      }
    }[]
  }
  
  let { 
    qnaPosts = []
  }: { 
    qnaPosts: QnAPost[]
  } = $props()
  
  let newQnATitle = $state('')
  let newQnAContent = $state('')
  let newQnAType = $state('question')
  let replyContent: Record<string, string> = $state({})
  
  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }
</script>

<div class="space-y-6">
  <!-- Create New Post -->
  <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-gray-900 p-8">
    <h2 class="text-xl font-bold text-gray-900 uppercase tracking-wide mb-4">Create New Post</h2>
    <form method="POST" action="?/createQnAPost" use:enhance class="space-y-4">
      <div>
        <label for="post_type" class="block text-sm font-bold text-gray-900 mb-2">Type</label>
        <select
          id="post_type"
          name="post_type"
          bind:value={newQnAType}
          class="w-full rounded-2xl border-2 border-gray-900 bg-white px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="question">Question</option>
          <option value="discussion">Discussion</option>
          <option value="announcement">Announcement</option>
        </select>
      </div>
      <div>
        <label for="post_title" class="block text-sm font-bold text-gray-900 mb-2">Title</label>
        <input
          id="post_title"
          type="text"
          name="title"
          bind:value={newQnATitle}
          placeholder="What's your question or topic?"
          class="w-full rounded-2xl border-2 border-gray-900 bg-white px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        />
      </div>
      <div>
        <label for="post_content" class="block text-sm font-bold text-gray-900 mb-2">Content</label>
        <textarea
          id="post_content"
          name="content"
          bind:value={newQnAContent}
          rows="4"
          placeholder="Provide details..."
          class="w-full rounded-2xl border-2 border-gray-900 bg-white px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          required
        ></textarea>
      </div>
      <button
        type="submit"
        class="w-full py-3 bg-gray-900 border-2 border-gray-900 rounded-full text-white font-bold hover:bg-red-500 hover:border-red-500 transition-all duration-200"
      >
        Post
      </button>
    </form>
  </div>

  <!-- Q&A Posts List -->
  <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-gray-900 overflow-hidden">
    <div class="px-8 py-6 border-b-2 border-gray-900 bg-white/60">
      <h2 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">All Posts</h2>
    </div>
    <div class="divide-y-2 divide-gray-900/20">
      {#if qnaPosts && qnaPosts.length > 0}
        {#each qnaPosts as post}
          <div class="p-8 hover:bg-white/40 transition-colors">
            <div class="flex items-start gap-4">
              <img 
                src={post.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.full_name || 'User')}`}
                alt={post.author?.full_name || 'User'}
                class="w-12 h-12 rounded-full border-2 border-gray-900 object-cover"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between mb-2">
                  <div>
                    <h3 class="text-lg font-bold text-gray-900">{post.title}</h3>
                    <p class="text-sm text-gray-700 mt-1">
                      by {post.author?.full_name} • {formatDate(post.created_at)}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-white border-2 border-gray-900">
                      {post.post_type}
                    </span>
                    {#if post.is_answered}
                      <span class="px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white border-2 border-gray-900">
                        Answered
                      </span>
                    {/if}
                  </div>
                </div>
                <p class="text-gray-800 mt-3">{post.content}</p>

                <!-- Replies -->
                {#if post.replies && post.replies.length > 0}
                  <div class="mt-6 space-y-4">
                    {#each post.replies as reply}
                      <div class="flex items-start gap-3 pl-6 border-l-4 border-gray-900">
                        <img 
                          src={reply.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author?.full_name || 'User')}`}
                          alt={reply.author?.full_name || 'User'}
                          class="w-8 h-8 rounded-full border-2 border-gray-900 object-cover"
                        />
                        <div class="flex-1">
                          <div class="bg-white/60 rounded-2xl border-2 border-gray-900 p-4">
                            <p class="text-sm font-bold text-gray-900">{reply.author?.full_name}</p>
                            <p class="text-sm text-gray-800 mt-2">{reply.content}</p>
                            {#if reply.is_accepted_answer}
                              <span class="inline-block mt-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full border-2 border-gray-900">
                                ✓ Accepted Answer
                              </span>
                            {/if}
                          </div>
                        </div>
                      </div>
                    {/each}
                  </div>
                {/if}

                <!-- Reply Form -->
                <form method="POST" action="?/createQnAReply" use:enhance class="mt-4">
                  <input type="hidden" name="post_id" value={post.id} />
                  <div class="flex gap-3">
                    <input
                      type="text"
                      name="content"
                      bind:value={replyContent[post.id]}
                      placeholder="Write a reply..."
                      class="flex-1 rounded-2xl border-2 border-gray-900 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                    <button
                      type="submit"
                      class="px-6 py-2 bg-white border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
                    >
                      Reply
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        {/each}
      {:else}
        <div class="p-16 text-center">
          <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p class="text-gray-700 font-medium">No Q&A posts yet. Start a discussion!</p>
        </div>
      {/if}
    </div>
  </div>
</div>

