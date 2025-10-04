<script lang="ts">
	import type { PageData } from './$types'
	import { goto } from '$app/navigation'
	import MentorCard from '$lib/components/MentorCard.svelte'

	let { data }: { data: PageData } = $props()

	// Filter state (initialized from URL params)
	let search = $state(data.filters.search || '')
	let selectedTopics = $state<string[]>(data.filters.topics || [])
	let selectedLevel = $state(data.filters.experienceLevel || '')
	let availableOnly = $state(data.filters.availableOnly || false)

	// Common topics and experience levels
	const topicOptions = [
		'Machine Learning',
		'Web Development',
		'Data Science',
		'Mobile Development',
		'DevOps',
		'Cybersecurity',
		'AI/NLP',
		'Cloud Computing',
		'Blockchain',
		'UI/UX Design'
	]

	const levelOptions = ['beginner', 'intermediate', 'advanced', 'expert']

	// Apply filters - update URL with query params
	function applyFilters() {
		const params = new URLSearchParams()

		if (search) params.set('search', search)
		if (selectedTopics.length > 0) params.set('topics', selectedTopics.join(','))
		if (selectedLevel) params.set('level', selectedLevel)
		if (availableOnly) params.set('available', 'true')

		const queryString = params.toString()
		goto(`/mentors${queryString ? '?' + queryString : ''}`, {
			keepFocus: true,
			noScroll: true
		})
	}

	// Reset all filters
	function resetFilters() {
		search = ''
		selectedTopics = []
		selectedLevel = ''
		availableOnly = false
		goto('/mentors', { keepFocus: true, noScroll: true })
	}

	// Toggle topic selection
	function toggleTopic(topic: string) {
		if (selectedTopics.includes(topic)) {
			selectedTopics = selectedTopics.filter((t) => t !== topic)
		} else {
			selectedTopics = [...selectedTopics, topic]
		}
	}

	// Check if any filters are active
	const hasActiveFilters = $derived(
		search || selectedTopics.length > 0 || selectedLevel || availableOnly
	)
</script>

<svelte:head>
	<title>Find AI Mentors | SenpAI</title>
	<meta
		name="description"
		content="Browse and connect with expert AI mentors for personalized guidance in machine learning, data science, and more."
	/>
</svelte:head>

<div class="min-h-screen" style="background-color: #f9f1dd;">
	<!-- Header -->
	<div class="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-gray-900">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
			<h1 class="text-4xl font-bold text-gray-900 mb-3">Find Your AI Mentor</h1>
			<p class="text-gray-800 text-lg">
				Connect with expert mentors for 1:1 sessions, project guidance, and career advice
			</p>
		</div>
	</div>

	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="flex flex-col lg:flex-row gap-8">
			<!-- Sidebar Filters -->
			<aside class="lg:w-72 flex-shrink-0">
				<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8 sticky top-8">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-xl font-bold text-gray-900">Filters</h2>
						{#if hasActiveFilters}
							<button
								onclick={resetFilters}
								class="text-sm text-red-600 hover:text-red-700 font-bold uppercase tracking-wide"
							>
								Reset
							</button>
						{/if}
					</div>

					<div class="space-y-6">
						<!-- Search -->
						<div>
							<label for="search" class="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
								Search
							</label>
							<input
								type="text"
								id="search"
								bind:value={search}
								placeholder="Name or keyword..."
								class="w-full px-4 py-2.5 bg-white/60 border-2 border-gray-900 text-gray-900 placeholder-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500"
								onkeydown={(e) => e.key === 'Enter' && applyFilters()}
							/>
						</div>

						<!-- Experience Level -->
						<div>
							<label for="level" class="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
								Experience Level
							</label>
							<select
								id="level"
								bind:value={selectedLevel}
								class="w-full px-4 py-2.5 bg-white/60 border-2 border-gray-900 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 capitalize"
							>
								<option value="">All Levels</option>
								{#each levelOptions as level}
									<option value={level} class="capitalize">{level}</option>
								{/each}
							</select>
						</div>

						<!-- Topics -->
						<div>
							<span class="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Topics</span>
							<div class="space-y-2.5 max-h-64 overflow-y-auto pr-2">
								{#each topicOptions as topic}
									<label class="flex items-center cursor-pointer group">
										<input
											type="checkbox"
											checked={selectedTopics.includes(topic)}
											onchange={() => toggleTopic(topic)}
											class="rounded border-gray-900 text-red-600 focus:ring-red-500 focus:ring-2 cursor-pointer"
										/>
										<span class="ml-3 text-sm text-gray-900 group-hover:text-red-600 transition-colors">{topic}</span>
									</label>
								{/each}
							</div>
						</div>

						<!-- Availability -->
						<div class="pt-4 border-t-2 border-gray-900/20">
							<label class="flex items-center cursor-pointer group">
								<input
									type="checkbox"
									bind:checked={availableOnly}
									class="rounded border-gray-900 text-red-600 focus:ring-red-500 focus:ring-2 cursor-pointer"
								/>
								<span class="ml-3 text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-wide">Available now</span>
							</label>
						</div>

						<!-- Apply Button -->
						<button
							onclick={applyFilters}
							class="w-full px-6 py-3.5 bg-transparent border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-colors duration-200 uppercase tracking-wide"
						>
							Apply Filters
						</button>
					</div>
				</div>
			</aside>

			<!-- Main Content -->
			<main class="flex-1 min-w-0">
				<!-- Results Count -->
				<div class="mb-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-gray-900 px-6 py-4">
					<p class="text-sm text-gray-900">
						<span class="font-bold text-2xl text-gray-900">{data.mentors.length}</span>
						<span class="ml-2 font-semibold uppercase tracking-wide">{data.mentors.length === 1 ? 'mentor' : 'mentors'} found</span>
					</p>
				</div>

				<!-- Mentor Grid -->
				{#if data.mentors.length > 0}
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
						{#each data.mentors as mentor (mentor.id)}
							<MentorCard {mentor} />
						{/each}
					</div>
				{:else}
					<!-- Empty State -->
					<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-12 text-center">
						<svg
							class="mx-auto h-16 w-16 text-gray-900"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						<h3 class="mt-6 text-2xl font-bold text-gray-900">No mentors found</h3>
						<p class="mt-3 text-base text-gray-800">
							Try adjusting your filters or search criteria to find more mentors.
						</p>
						{#if hasActiveFilters}
							<button
								onclick={resetFilters}
								class="mt-6 inline-flex items-center px-6 py-3 border-2 border-gray-900 text-sm font-bold rounded-full text-gray-900 bg-transparent hover:bg-gray-900 hover:text-white transition-colors duration-200 uppercase tracking-wide"
							>
								Clear all filters
							</button>
						{/if}
					</div>
				{/if}
			</main>
		</div>
	</div>
</div>

