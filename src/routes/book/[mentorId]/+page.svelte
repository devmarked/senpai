<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let isSubmitting = $state(false)

	const monthlyPrice = $derived(data.mentor.monthly_rate || 0)
</script>

<svelte:head>
	<title>Subscribe to {data.mentor.full_name} - SenpAI</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8">
	<!-- Header -->
	<div class="mb-8">
		<a href="/mentors/{data.mentor.slug}" class="text-sm text-blue-600 hover:text-blue-800"
			>&larr; Back to {data.mentor.full_name}'s profile</a
		>
		<h1 class="mt-4 text-3xl font-bold">Subscribe to Monthly Mentorship</h1>
		<p class="mt-2 text-gray-600">
			Get unlimited mentorship sessions with {data.mentor.full_name}
		</p>
	</div>

	{#if data.existingSubscription}
		<!-- Already Subscribed Message -->
		<div class="rounded-lg border border-blue-300 bg-blue-50 p-6">
			<div class="flex items-center">
				<svg
					class="mr-3 h-6 w-6 text-blue-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<div>
					<h3 class="font-semibold text-blue-900">You're Already Subscribed!</h3>
					<p class="text-sm text-blue-700">
						You already have an active subscription with {data.mentor.full_name}.
					</p>
				</div>
			</div>
			<div class="mt-4 flex gap-3">
				<a
					href="/account/subscriptions"
					class="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
				>
					View My Subscriptions
				</a>
				<a
					href="/mentors"
					class="rounded-lg border border-blue-600 px-6 py-2 text-blue-600 hover:bg-blue-50"
				>
					Browse Other Mentors
				</a>
			</div>
		</div>
	{:else}
		<div class="grid gap-8 lg:grid-cols-3">
			<!-- Subscription Details (Left Column) -->
			<div class="lg:col-span-2">
				<div class="space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
					<h2 class="text-2xl font-bold">Monthly Mentorship Subscription</h2>

					<!-- What's Included -->
					<div>
						<h3 class="mb-4 text-lg font-semibold text-gray-900">What's Included:</h3>
						<ul class="space-y-3">
							<li class="flex items-start">
								<svg
									class="mr-3 h-6 w-6 flex-shrink-0 text-green-500"
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
								<span class="text-gray-700">Unlimited 1-on-1 mentorship sessions</span>
							</li>
							<li class="flex items-start">
								<svg
									class="mr-3 h-6 w-6 flex-shrink-0 text-green-500"
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
								<span class="text-gray-700">Direct messaging with your mentor</span>
							</li>
							<li class="flex items-start">
								<svg
									class="mr-3 h-6 w-6 flex-shrink-0 text-green-500"
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
								<span class="text-gray-700">Code reviews and project guidance</span>
							</li>
							<li class="flex items-start">
								<svg
									class="mr-3 h-6 w-6 flex-shrink-0 text-green-500"
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
								<span class="text-gray-700">Career advice and planning</span>
							</li>
							<li class="flex items-start">
								<svg
									class="mr-3 h-6 w-6 flex-shrink-0 text-green-500"
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
								<span class="text-gray-700">Flexible scheduling based on availability</span>
							</li>
							<li class="flex items-start">
								<svg
									class="mr-3 h-6 w-6 flex-shrink-0 text-green-500"
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
								<span class="text-gray-700">Cancel anytime - no commitment required</span>
							</li>
						</ul>
					</div>

					<!-- Subscription Terms -->
					<div class="rounded-lg bg-gray-50 p-4">
						<h3 class="mb-2 font-semibold text-gray-900">Subscription Terms:</h3>
						<ul class="space-y-2 text-sm text-gray-600">
							<li>• Billed monthly at ${monthlyPrice}/month</li>
							<li>• Automatically renews each month</li>
							<li>• Cancel anytime from your dashboard</li>
							<li>• Full access until the end of your billing period after cancellation</li>
							<li>• No refunds for partial months</li>
						</ul>
					</div>

					<!-- Subscribe Form -->
					<form
						method="POST"
						use:enhance={() => {
							isSubmitting = true
							return async ({ update }) => {
								await update()
								isSubmitting = false
							}
						}}
					>
						<button
							type="submit"
							disabled={isSubmitting || monthlyPrice <= 0}
							class="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
						>
							{#if isSubmitting}
								Processing...
							{:else if monthlyPrice <= 0}
								Not Available
							{:else}
								Subscribe for ${monthlyPrice}/month
							{/if}
						</button>
					</form>

					<p class="text-center text-xs text-gray-500">
						Payment processed securely via Stripe. You can cancel anytime.
					</p>
				</div>
			</div>

			<!-- Summary Card (Right Column) -->
			<div class="lg:col-span-1">
				<div class="sticky top-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-lg font-semibold">Subscription Summary</h2>

					<!-- Mentor Info -->
					<div class="mb-6 flex items-center space-x-3 border-b border-gray-200 pb-4">
						{#if data.mentor.avatar_url}
							<img
								src={data.mentor.avatar_url}
								alt={data.mentor.full_name}
								class="h-16 w-16 rounded-full object-cover"
							/>
						{:else}
							<div class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300">
								<span class="text-xl font-semibold text-gray-600">
									{data.mentor.full_name?.charAt(0)}
								</span>
							</div>
						{/if}
						<div>
							<p class="font-medium">{data.mentor.full_name}</p>
							{#if data.mentor.experience_level}
								<p class="text-sm text-gray-500 capitalize">{data.mentor.experience_level} Level</p>
							{/if}
						</div>
					</div>

					<!-- Pricing -->
					<div class="space-y-3 text-sm">
						<div class="flex justify-between">
							<span class="text-gray-600">Plan:</span>
							<span class="font-medium">Monthly Mentorship</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Billing:</span>
							<span class="font-medium">Monthly</span>
						</div>
						<div class="flex justify-between border-t border-gray-200 pt-3 text-lg font-semibold">
							<span>Total per month:</span>
							<span class="text-blue-600">${monthlyPrice}</span>
						</div>
					</div>

					<!-- Topics -->
					{#if data.mentor.topics && data.mentor.topics.length > 0}
						<div class="mt-6 border-t border-gray-200 pt-4">
							<p class="mb-2 text-sm font-medium text-gray-700">Expertise:</p>
							<div class="flex flex-wrap gap-2">
								{#each data.mentor.topics.slice(0, 5) as topic}
									<span class="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
										{topic}
									</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Rating -->
					{#if data.mentor.average_rating}
						<div class="mt-4 flex items-center justify-center gap-2 border-t border-gray-200 pt-4">
							<div class="flex">
								{#each Array(5) as _, i}
									<svg
										class="h-5 w-5 {i < Math.floor(data.mentor.average_rating || 0)
											? 'text-yellow-500'
											: 'text-gray-300'}"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
										/>
									</svg>
								{/each}
							</div>
							<span class="text-sm font-medium">{data.mentor.average_rating.toFixed(1)}</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
