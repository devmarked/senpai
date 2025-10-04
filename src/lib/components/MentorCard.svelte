<script lang="ts">
	import type { Tables } from '$lib/types/database.types'

	interface Props {
		mentor: Tables<'profiles'>
	}

	let { mentor }: Props = $props()

	// Format monthly rate
	const formatRate = (rate: number | null) => {
		if (!rate) return 'Free'
		return `$${rate}/mo`
	}

	// Get initials for avatar fallback
	const getInitials = (name: string | null) => {
		if (!name) return 'M'
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2)
	}
</script>

<a
	href="/mentors/{mentor.slug}"
	class="group block bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 hover:shadow-2xl transition-all duration-300 overflow-hidden"
>
	<div class="p-8">
		<!-- Availability Badge at Top -->
		{#if mentor.is_available}
			<div class="text-center mb-4">
				<span class="text-green-600 font-bold text-sm tracking-wider uppercase">
					Available Now
				</span>
			</div>
		{:else}
			<div class="text-center mb-4">
				<span class="text-gray-500 font-bold text-sm tracking-wider uppercase">
					By Appointment
				</span>
			</div>
		{/if}

		<!-- Avatar - Centered -->
		<div class="flex justify-center mb-4">
			{#if mentor.avatar_url}
				<img
					src={mentor.avatar_url}
					alt={mentor.full_name || 'Mentor'}
					class="w-20 h-20 rounded-full object-cover border-2 border-gray-900"
				/>
			{:else}
				<div
					class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xl border-2 border-gray-900"
				>
					{getInitials(mentor.full_name)}
				</div>
			{/if}
		</div>

		<!-- Name with Verified Badge -->
		<div class="text-center mb-2">
			<div class="flex items-center justify-center gap-2">
				<h3 class="text-xl font-bold text-gray-900">
					{mentor.full_name || 'Anonymous Mentor'}
				</h3>
				{#if mentor.is_verified}
					<svg
						class="w-5 h-5 text-red-500"
						fill="currentColor"
						viewBox="0 0 20 20"
						aria-label="Verified"
					>
						<path
							fill-rule="evenodd"
							d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
				{/if}
			</div>
		</div>

		<!-- Experience Level -->
		{#if mentor.experience_level}
			<p class="text-center text-sm text-gray-700 capitalize mb-6">
				{mentor.experience_level} Level
			</p>
		{/if}

		<!-- Price - Large and Centered -->
		<div class="text-center mb-2">
			<span class="text-5xl font-bold text-gray-900">
				{formatRate(mentor.monthly_rate)}
			</span>
		</div>

		<!-- Per month text -->
		<p class="text-center text-sm text-gray-700 mb-8">
			{mentor.monthly_rate ? 'Monthly subscription' : 'Free consultation'}
		</p>

		<!-- CTA Button -->
		<button
			class="w-full bg-transparent border-2 border-gray-900 rounded-full py-3.5 px-6 text-gray-900 font-semibold text-base hover:bg-gray-900 hover:text-white transition-colors duration-200 mb-8"
		>
			Book This Mentor
		</button>

		<!-- Features/Info List -->
		<div class="space-y-3 mb-6">
			<!-- Rating -->
			{#if mentor.average_rating}
				<div class="flex items-center gap-3">
					<svg
						class="w-5 h-5 flex-shrink-0 text-red-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span class="text-gray-900 text-sm font-medium">
						{mentor.average_rating.toFixed(1)} ⭐ Average Rating
					</span>
				</div>
			{/if}

			<!-- Sessions -->
			{#if mentor.total_sessions && mentor.total_sessions > 0}
				<div class="flex items-center gap-3">
					<svg
						class="w-5 h-5 flex-shrink-0 text-red-500"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					<span class="text-gray-900 text-sm">
						{mentor.total_sessions}+ Completed Sessions
					</span>
				</div>
			{/if}

		</div>

		<!-- Topics -->
		{#if mentor.topics && mentor.topics.length > 0}
			<div class="pt-6 border-t border-gray-900/20">
				<div class="flex flex-wrap gap-2 justify-center">
					{#each mentor.topics.slice(0, 3) as topic}
						<span
							class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-gray-800 border border-gray-900/30"
						>
							{topic}
						</span>
					{/each}
					{#if mentor.topics.length > 3}
						<span
							class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-gray-800 border border-gray-900/30"
						>
							+{mentor.topics.length - 3} more
						</span>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Bio - at bottom if exists -->
		{#if mentor.bio}
			<div class="mt-6 pt-6 border-t border-gray-900/20">
				<p class="text-gray-700 text-xs text-center line-clamp-2 italic">
					"{mentor.bio}"
				</p>
			</div>
		{/if}
	</div>
</a>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>

