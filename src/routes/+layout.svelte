<script lang="ts">
  import { invalidate } from '$app/navigation'
  import { navigating } from '$app/state'
  import { onMount } from 'svelte'
  import Header from '$lib/components/Header.svelte'
  import FloatingMascot from '$lib/components/FloatingMascot.svelte'
  import Loader from '$lib/components/Loader.svelte'
  import '../app.css'

  let { data, children } = $props()
  let supabase = $derived(data.supabase)
  let user = $derived(data.user)
  let profile = $derived(data.profile)
  
  // Show loader on initial load and during navigation
  let isLoading = $state(true)
  // navigating.to is null when not navigating, or contains route info when navigating
  let isNavigating = $derived(navigating?.to !== null && navigating?.to !== undefined)
  let showLoader = $derived(isLoading || isNavigating)

  onMount(() => {
    // Hide initial loader after a small delay to ensure page is ready
    const timer = setTimeout(() => {
      isLoading = false
    }, 50)
    
    // Listen for auth events and invalidate to refetch from server
    // Server will validate the session using safeGetSession()
    const { data: authData } = supabase.auth.onAuthStateChange((event, _session) => {
      // Invalidate on any auth state change to refetch validated data from server
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        invalidate('supabase:auth')
      }
    })

    return () => {
      clearTimeout(timer)
      authData.subscription.unsubscribe()
    }
  })
</script>

<svelte:head>
  <title>SenpAI - AI Mentorship Marketplace</title>
</svelte:head>

<Loader show={showLoader} />

<div class="min-h-screen flex flex-col" style="background-color: #f9f1dd;">
  <Header user={user} profile={profile} />
  <main class="flex-1">
    {@render children()}
  </main>
  <FloatingMascot />
</div>
