<script lang="ts">
  import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'
  import Header from '$lib/components/Header.svelte'
  import FloatingMascot from '$lib/components/FloatingMascot.svelte'
  import '../app.css'

  let { data, children } = $props()
  let { supabase, user, profile } = $derived(data)

  onMount(() => {
    // Listen for auth events and invalidate to refetch from server
    // Server will validate the session using safeGetSession()
    const { data } = supabase.auth.onAuthStateChange((event, _session) => {
      // Invalidate on any auth state change to refetch validated data from server
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        invalidate('supabase:auth')
      }
    })

    return () => data.subscription.unsubscribe()
  })
</script>

<svelte:head>
  <title>SenpAI - AI Mentorship Marketplace</title>
</svelte:head>

<div class="min-h-screen flex flex-col" style="background-color: #f9f1dd;">
  <Header user={user} profile={profile} />
  <main class="flex-1">
    {@render children()}
  </main>
  <FloatingMascot />
</div>
