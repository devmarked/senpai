<script lang="ts">
  type QnAPost = {
    id: string
    title: string
    is_answered: boolean
    author?: {
      full_name: string
    }
    replies?: any[]
  }
  
  let { 
    qnaPosts = [],
    onViewAll
  }: { 
    qnaPosts: QnAPost[]
    onViewAll: () => void
  } = $props()
</script>

{#if qnaPosts.length > 0}
  <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-gray-900 p-8 lg:col-span-2">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900 uppercase tracking-wide">Recent Q&A</h2>
      <button 
        onclick={onViewAll}
        class="text-sm font-bold text-gray-900 hover:text-red-500 transition-colors"
      >
        View all →
      </button>
    </div>
    <div class="space-y-3">
      {#each qnaPosts.slice(0, 3) as post}
        <div class="bg-white/60 rounded-2xl border-2 border-gray-900 p-4 hover:bg-white transition-colors">
          <div class="flex items-start gap-3">
            <div class="flex-1">
              <h3 class="font-bold text-gray-900">{post.title}</h3>
              <p class="text-xs text-gray-600 mt-1">
                by {post.author?.full_name} • {post.replies?.length || 0} replies
              </p>
            </div>
            {#if post.is_answered}
              <span class="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full border-2 border-gray-900">
                Answered
              </span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

