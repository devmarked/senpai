<script lang="ts">
  import logo from '$lib/assets/senpai_logo.png'
  
  let { show = $bindable(false) } = $props()
</script>

{#if show}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#f9f1dd]">
    <div class="flex flex-col items-center gap-4">
      <!-- Bouncing Logo -->
      <img 
        src={logo} 
        alt="SenpAI Loading" 
        class="w-32 h-32 object-contain animate-bounce"
      />
    </div>
  </div>
{/if}

<style>
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: translateY(-25%);
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }
</style>
