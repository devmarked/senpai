<script lang="ts">
  type Mentorship = {
    total_messages?: number
    total_qna_posts?: number
    status: string
  }
  
  let { 
    mentorship,
    filesCount = 0
  }: { 
    mentorship: Mentorship
    filesCount: number
  } = $props()
</script>

<div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl border-2 border-gray-900 p-8">
  <h2 class="text-xl font-bold text-gray-900 uppercase tracking-wide mb-4">Activity</h2>
  <div class="grid grid-cols-2 gap-4">
    <div class="bg-white/60 rounded-2xl border-2 border-gray-900 p-4 text-center">
      <div class="text-3xl font-bold text-gray-900">{mentorship.total_messages || 0}</div>
      <div class="text-xs font-bold text-gray-700 uppercase mt-1">Messages</div>
    </div>
    <div class="bg-white/60 rounded-2xl border-2 border-gray-900 p-4 text-center">
      <div class="text-3xl font-bold text-gray-900">{mentorship.total_qna_posts || 0}</div>
      <div class="text-xs font-bold text-gray-700 uppercase mt-1">Q&A Posts</div>
    </div>
    <div class="bg-white/60 rounded-2xl border-2 border-gray-900 p-4 text-center">
      <div class="text-3xl font-bold text-gray-900">{filesCount}</div>
      <div class="text-xs font-bold text-gray-700 uppercase mt-1">Files</div>
    </div>
    <div class="bg-white/60 rounded-2xl border-2 border-gray-900 p-4 text-center">
      <div class="text-3xl font-bold text-gray-900">{mentorship.status}</div>
      <div class="text-xs font-bold text-gray-700 uppercase mt-1">Status</div>
    </div>
  </div>
</div>

