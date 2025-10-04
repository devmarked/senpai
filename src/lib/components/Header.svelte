<script lang="ts">
	import { page } from '$app/stores'
	import senpaiLogo from '$lib/assets/senpai_logo.png'

	let { user, profile } = $props<{ user: any; profile?: any }>()
</script>

<header class="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-gray-900">
	<nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex justify-between items-center h-20">
			<!-- Logo -->
			<div class="flex items-center">
				<a href="/" class="flex items-center">
					<img 
						src={senpaiLogo} 
						alt="SenpAI" 
						class="h-12 w-auto"
					/>
				</a>
			</div>

			<!-- Navigation Links -->
			<div class="hidden md:flex items-center space-x-6">
				<a
					href="/mentors"
					class="text-gray-900 hover:text-red-600 font-bold transition-colors uppercase tracking-wide text-sm"
					class:text-red-600={$page.url.pathname.startsWith('/mentors')}
				>
					Find Mentors
				</a>
				
				{#if user}
					<a
						href="/account"
						class="text-gray-900 hover:text-red-600 font-bold transition-colors uppercase tracking-wide text-sm"
						class:text-red-600={$page.url.pathname === '/account'}
					>
						Dashboard
					</a>
					{#if profile && (profile.role === 'mentor' || profile.role === 'both')}
						<a
							href="/account/mentor"
							class="text-gray-900 hover:text-red-600 font-bold transition-colors uppercase tracking-wide text-sm"
							class:text-red-600={$page.url.pathname.startsWith('/account/mentor')}
						>
							Mentor Hub
						</a>
					{/if}
					<a
						href="/messages"
						class="text-gray-900 hover:text-red-600 font-bold transition-colors uppercase tracking-wide text-sm"
						class:text-red-600={$page.url.pathname.startsWith('/messages')}
					>
						Messages
					</a>
				{/if}
			</div>

			<!-- Auth Buttons -->
			<div class="flex items-center space-x-3">
				{#if user}
					<div class="flex items-center space-x-3">
						<span class="text-sm text-gray-800 font-medium hidden sm:block">{user.email}</span>
						<form method="post" action="/auth/login?/signout">
							<button
								type="submit"
								class="px-5 py-2.5 text-sm font-bold text-gray-900 hover:text-red-600 transition-colors uppercase tracking-wide"
							>
								Sign Out
							</button>
						</form>
					</div>
				{:else}
					<a
						href="/auth/login"
						class="px-5 py-2.5 text-sm font-bold text-gray-900 hover:text-red-600 transition-colors uppercase tracking-wide"
					>
						Sign In
					</a>
					<a
						href="/auth/login"
						class="px-6 py-2.5 text-sm font-bold text-white bg-gray-900 rounded-full hover:bg-red-600 transition-colors duration-200 uppercase tracking-wide border-2 border-gray-900 hover:border-red-600"
					>
						Get Started
					</a>
				{/if}
			</div>
		</div>
	</nav>
</header>

