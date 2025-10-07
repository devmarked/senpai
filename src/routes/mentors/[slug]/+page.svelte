<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()
	let { mentor, reviews } = $derived(data)

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

	// Format date
	function formatDate(dateString: string | null) {
		if (!dateString) return 'Recent'
		const date = new Date(dateString)
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
	}

	// Calculate rating statistics
	const ratingStats = $derived.by(() => {
		if (reviews.length === 0) return null

		const totalRatings = reviews.length
		const ratingCounts = [0, 0, 0, 0, 0] // Indices 0-4 for ratings 1-5

		reviews.forEach((review) => {
			ratingCounts[review.rating - 1]++
		})

		return {
			total: totalRatings,
			distribution: ratingCounts.map((count, index) => ({
				stars: index + 1,
				count,
				percentage: totalRatings > 0 ? (count / totalRatings) * 100 : 0
			}))
		}
	})
</script>

<svelte:head>
	<title>{mentor.full_name || 'Mentor'} - SenpAI</title>
	<meta
		name="description"
		content={mentor.bio || `Connect with ${mentor.full_name} for AI mentorship sessions`}
	/>
</svelte:head>

<div class="min-h-screen" style="background-color: #f9f1dd;">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<div class="grid lg:grid-cols-3 gap-8">
			<!-- Main Content -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Mentor Header Card -->
				<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8">
					<div class="flex flex-col sm:flex-row gap-6">
						<!-- Avatar -->
						{#if mentor.avatar_url}
							<img
								src={mentor.avatar_url}
								alt={mentor.full_name || 'Mentor'}
								class="w-32 h-32 rounded-full object-cover ring-4 ring-gray-900"
							/>
						{:else}
							<div
								class="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl ring-4 ring-gray-900"
							>
								{getInitials(mentor.full_name)}
							</div>
						{/if}

						<!-- Info -->
						<div class="flex-1 min-w-0">
							<div class="flex flex-wrap items-start gap-3 mb-3">
								<h1 class="text-3xl font-bold text-gray-900">
									{mentor.full_name || 'Anonymous Mentor'}
								</h1>
								{#if mentor.is_verified}
									<svg
										class="w-8 h-8 text-red-500"
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

							{#if mentor.experience_level}
								<span
									class="inline-block px-3 py-1 rounded-full text-sm font-bold bg-white/60 text-gray-900 mb-4 capitalize border border-gray-900/30"
								>
									{mentor.experience_level} Level
								</span>
							{/if}

							<!-- Stats -->
							<div class="flex flex-wrap gap-6 mb-4">
								{#if mentor.average_rating}
									<div class="flex items-center gap-2">
										<svg class="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
											<path
												d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
											/>
										</svg>
										<span class="text-xl font-bold text-gray-900">{mentor.average_rating.toFixed(1)}</span>
										<span class="text-gray-800">({reviews.length} reviews)</span>
									</div>
								{/if}

								{#if mentor.total_sessions && mentor.total_sessions > 0}
									<div class="flex items-center gap-2">
										<svg
											class="w-6 h-6 text-red-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											stroke-width="2"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
											/>
										</svg>
										<span class="text-gray-900 font-semibold">{mentor.total_sessions}</span>
										<span class="text-gray-800">sessions completed</span>
									</div>
								{/if}
							</div>

							{#if mentor.is_available}
								<span
									class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-green-100 text-green-700 border-2 border-green-600"
								>
									<span class="w-2 h-2 rounded-full bg-green-600 mr-2"></span>
									Available for sessions
								</span>
							{/if}
						</div>
					</div>
				</div>

				<!-- About Section -->
				{#if mentor.bio}
					<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-6">
						<h2 class="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">About</h2>
						<p class="text-gray-800 whitespace-pre-line leading-relaxed">{mentor.bio}</p>
					</div>
				{/if}

				<!-- Topics/Skills -->
				{#if mentor.topics && mentor.topics.length > 0}
					<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-6">
						<h2 class="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Expertise</h2>
						<div class="flex flex-wrap gap-2">
							{#each mentor.topics as topic}
								<span
									class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/60 text-gray-900 border border-gray-900/30"
								>
									{topic}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Languages -->
				{#if mentor.languages_spoken && mentor.languages_spoken.length > 0}
					<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-6">
						<h2 class="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Languages</h2>
						<div class="flex flex-wrap gap-2">
							{#each mentor.languages_spoken as language}
								<span
									class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/60 text-gray-900 border border-gray-900/30"
								>
									{language}
								</span>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Reviews Section -->
				{#if reviews.length > 0}
					<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-6">
						<h2 class="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wide">Reviews</h2>

						<!-- Rating Distribution -->
						{#if ratingStats}
							<div class="mb-8 pb-8 border-b-2 border-gray-900/20">
								<div class="flex items-center gap-8">
									<div class="text-center">
										<div class="text-5xl font-bold text-gray-900 mb-1">
											{mentor.average_rating?.toFixed(1)}
										</div>
										<div class="flex items-center gap-1 mb-1">
											{#each Array(5) as _, i}
												<svg
													class="w-5 h-5 {i < Math.round(mentor.average_rating || 0) ? 'text-yellow-500' : 'text-gray-400'}"
													fill="currentColor"
													viewBox="0 0 20 20"
												>
													<path
														d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
													/>
												</svg>
											{/each}
										</div>
										<div class="text-sm text-gray-800 font-semibold">{ratingStats.total} reviews</div>
									</div>

									<div class="flex-1 space-y-2">
										{#each ratingStats.distribution.reverse() as { stars, count, percentage }}
											<div class="flex items-center gap-3">
												<span class="text-sm text-gray-900 font-medium w-16">{stars} stars</span>
												<div class="flex-1 h-3 bg-white/60 rounded-full overflow-hidden border border-gray-900/20">
													<div
														class="h-full bg-yellow-500"
														style="width: {percentage}%"
													></div>
												</div>
												<span class="text-sm text-gray-900 font-medium w-8">{count}</span>
											</div>
										{/each}
									</div>
								</div>
							</div>
						{/if}

						<!-- Individual Reviews -->
						<div class="space-y-6">
							{#each reviews as review}
								<div class="border-b-2 border-gray-900/20 last:border-0 pb-6 last:pb-0">
									<div class="flex items-start gap-4">
										{#if review.mentee.avatar_url}
											<img
												src={review.mentee.avatar_url}
												alt={review.mentee.full_name}
												class="w-12 h-12 rounded-full object-cover border-2 border-gray-900"
											/>
										{:else}
											<div
												class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold border-2 border-gray-900"
											>
												{getInitials(review.mentee.full_name)}
											</div>
										{/if}

										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-3 mb-2">
												<span class="font-bold text-gray-900">{review.mentee.full_name}</span>
												<div class="flex items-center">
													{#each Array(5) as _, i}
														<svg
															class="w-4 h-4 {i < review.rating ? 'text-yellow-500' : 'text-gray-400'}"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
															/>
														</svg>
													{/each}
												</div>
												<span class="text-sm text-gray-700">{formatDate(review.created_at)}</span>
											</div>
											{#if review.comment}
												<p class="text-gray-800">{review.comment}</p>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="lg:col-span-1">
				<div class="sticky top-8 space-y-6">
					<!-- Pricing & Booking Card -->
					<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8">
						<div class="text-center mb-6">
							<div class="mb-2">
								<span class="text-red-500 font-bold text-sm tracking-wider uppercase">
									{#if !mentor.monthly_rate}
										FREE
									{:else if mentor.monthly_rate < 100}
										STARTER
									{:else if mentor.monthly_rate < 300}
										PRO
									{:else}
										PREMIUM
									{/if}
								</span>
							</div>
							<div class="flex justify-center items-baseline gap-2 mb-2">
								<span class="text-5xl font-bold text-gray-900">
									{#if mentor.monthly_rate}
										${mentor.monthly_rate}
									{:else}
										$0
									{/if}
								</span>
								{#if mentor.monthly_rate}
									<span class="text-gray-700 text-lg">/month</span>
								{/if}
							</div>
							<div class="text-sm text-gray-800 space-y-2 text-left">
								<div class="flex items-start gap-2 justify-start">
									<svg class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
									</svg>
									<span class="text-left">4 calls per month (60min/call)</span>
								</div>
								<div class="flex items-start gap-2 justify-start">
									<svg class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
									</svg>
									<span class="text-left">Unlimited Q&A via chat</span>
								</div>
								<div class="flex items-start gap-2 justify-start">
									<svg class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
									</svg>
									<span class="text-left">Expect responses in 24 hours or less</span>
								</div>
								<div class="flex items-start gap-2 justify-start">
									<svg class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
									</svg>
									<span class="text-left">Hands-on support</span>
								</div>
							</div>
						</div>

						<a
							href="/book/{mentor.id}"
							class="block w-full px-6 py-3.5 bg-transparent border-2 border-gray-900 text-gray-900 text-center font-bold rounded-full hover:bg-gray-900 hover:text-white transition-colors duration-200 mb-4 uppercase tracking-wide"
						>
							Subscribe
						</a>
					</div>

				</div>
			</div>
		</div>
	</div>
</div>

