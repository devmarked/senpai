<script lang="ts">
  type File = {
    id: string
    filename: string
    file_size?: number
    description?: string
    storage_url?: string
    uploader?: {
      full_name: string
    }
  }
  
  let { 
    files = []
  }: { 
    files: File[]
  } = $props()
  
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }
</script>

<div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-gray-900 overflow-hidden">
  <div class="px-8 py-6 border-b-2 border-gray-900 bg-white/60">
    <h2 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">Shared Files</h2>
    <p class="text-sm text-gray-700 font-medium mt-1">Resources and documents</p>
  </div>
  <div class="p-8">
    {#if files && files.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each files as file}
          <div class="bg-white/60 rounded-2xl border-2 border-gray-900 p-6 hover:bg-white transition-colors">
            <div class="flex items-start justify-between mb-3">
              <svg class="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="font-bold text-gray-900 text-sm truncate">{file.filename}</h3>
            <p class="text-xs text-gray-600 mt-1">
              {formatFileSize(file.file_size || 0)} • {file.uploader?.full_name}
            </p>
            {#if file.description}
              <p class="text-xs text-gray-700 mt-2">{file.description}</p>
            {/if}
            {#if file.storage_url}
              <a 
                href={file.storage_url}
                target="_blank"
                rel="noopener noreferrer"
                class="mt-3 block text-center px-4 py-2 bg-white border-2 border-gray-900 rounded-full text-gray-900 font-bold text-xs hover:bg-gray-900 hover:text-white transition-all duration-200"
              >
                Download
              </a>
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-16">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-700 font-medium">No files shared yet</p>
        <p class="text-sm text-gray-600 mt-2">Upload resources, documents, or code samples to share</p>
      </div>
    {/if}
  </div>
</div>

