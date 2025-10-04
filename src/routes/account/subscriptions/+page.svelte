<script lang="ts">
	import { enhance } from '$app/forms'
	import type { PageData, ActionData } from './$types'

	let { data, form }: { data: PageData; form: ActionData } = $props()

	let activeTab = $state<'active' | 'past_due' | 'cancelled'>('active')

	const currentSubscriptions = $derived(
		activeTab === 'active'
			? data.active
			: activeTab === 'past_due'
				? data.pastDue
				: data.cancelled
	)

	const formatDate = (dateStr: string | null) => {
		if (!dateStr) return 'N/A'
		const date = new Date(dateStr)
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

	const getStatusBadgeClass = (status: string) => {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800'
			case 'past_due':
				return 'bg-yellow-100 text-yellow-800'
			case 'cancelled':
				return 'bg-red-100 text-red-800'
			case 'paused':
				return 'bg-gray-100 text-gray-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	let cancellingId = $state<string | null>(null)
	let reactivatingId = $state<string | null>(null)
</script>

<div class="mx-auto max-w-6xl px-4 py-8">
	<!-- Success Message -->
	{#if data.success}
		<div class="mb-6 rounded-lg border border-green-300 bg-green-50 p-4">
			<div class="flex items-center">
				<svg
					class="mr-3 h-6 w-6 text-green-600"
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
					<h3 class="font-semibold text-green-900">Subscription Activated!</h3>
					<p class="text-sm text-green-700">
						Your monthly mentorship subscription is now active. Start connecting with your mentor!
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Form Action Messages -->
	{#if form?.success}
		<div class="mb-6 rounded-lg border border-blue-300 bg-blue-50 p-4">
			<p class="text-sm text-blue-800">{form.message}</p>
		</div>
	{:else if form?.error}
		<div class="mb-6 rounded-lg border border-red-300 bg-red-50 p-4">
			<p class="text-sm text-red-800">{form.error}</p>
		</div>
	{/if}

	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold">My Subscriptions</h1>
		<p class="mt-2 text-gray-600">Manage your monthly mentorship subscriptions</p>
	</div>

	<!-- Tabs -->
	<div class="mb-6 border-b border-gray-200">
		<nav class="-mb-px flex space-x-8">
			<button
				onclick={() => (activeTab = 'active')}
				class={`border-b-2 px-1 py-4 text-sm font-medium ${
					activeTab === 'active'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
				}`}
			>
				Active ({data.active.length})
			</button>
			<button
				onclick={() => (activeTab = 'past_due')}
				class={`border-b-2 px-1 py-4 text-sm font-medium ${
					activeTab === 'past_due'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
				}`}
			>
				Past Due ({data.pastDue.length})
			</button>
			<button
				onclick={() => (activeTab = 'cancelled')}
				class={`border-b-2 px-1 py-4 text-sm font-medium ${
					activeTab === 'cancelled'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
				}`}
			>
				Cancelled ({data.cancelled.length})
			</button>
		</nav>
	</div>

	<!-- Subscriptions List -->
	<div class="space-y-4">
		{#if currentSubscriptions.length === 0}
			<div class="rounded-lg border border-gray-200 bg-white p-8 text-center">
				<svg
					class="mx-auto h-12 w-12 text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
				<h3 class="mt-4 text-lg font-medium text-gray-900">No {activeTab} subscriptions</h3>
				<p class="mt-2 text-sm text-gray-500">
					{#if activeTab === 'active'}
						Subscribe to a mentor to get started!
					{:else if activeTab === 'past_due'}
						No subscriptions with payment issues at the moment.
					{:else}
						Your cancelled subscriptions will appear here.
					{/if}
				</p>
				{#if activeTab === 'active'}
					<a
						href="/mentors"
						class="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
					>
						Browse Mentors
					</a>
				{/if}
			</div>
		{:else}
			{#each currentSubscriptions as subscription}
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<div class="flex items-start justify-between">
						<!-- Left: Subscription Info -->
						<div class="flex-1">
							<div class="flex items-start space-x-4">
								<!-- Mentor Avatar -->
								<a href="/mentors/{subscription.mentor.slug}" class="flex-shrink-0">
									{#if subscription.mentor.avatar_url}
										<img
											src={subscription.mentor.avatar_url}
											alt={subscription.mentor.full_name}
											class="h-16 w-16 rounded-full object-cover"
										/>
									{:else}
										<div
											class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300"
										>
											<span class="text-xl font-semibold text-gray-600">
												{subscription.mentor.full_name?.charAt(0)}
											</span>
										</div>
									{/if}
								</a>

								<!-- Subscription Details -->
								<div class="flex-1">
									<div class="mb-2 flex items-start justify-between">
										<div>
											<h3 class="text-lg font-semibold">
												Monthly Mentorship with {subscription.mentor.full_name}
											</h3>
											<a
												href="/mentors/{subscription.mentor.slug}"
												class="text-sm text-gray-600 hover:text-blue-600"
											>
												View Profile
											</a>
										</div>
									</div>

									<div class="space-y-1 text-sm text-gray-600">
										<p>
											<strong>Price:</strong>
											${subscription.monthly_price.toFixed(2)}/{subscription.currency?.toUpperCase()}/month
										</p>
										{#if subscription.current_period_end}
											<p>
												<strong>Current Period Ends:</strong>
												{formatDate(subscription.current_period_end)}
											</p>
										{/if}
										{#if subscription.cancel_at_period_end}
											<p class="text-yellow-600">
												⚠️ Subscription will cancel at the end of the billing period
											</p>
										{/if}
									</div>

									{#if subscription.mentor.topics && subscription.mentor.topics.length > 0}
										<div class="mt-3 flex flex-wrap gap-2">
											{#each subscription.mentor.topics.slice(0, 5) as topic}
												<span class="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">
													{topic}
												</span>
											{/each}
										</div>
									{/if}

									<!-- Actions -->
									<div class="mt-4 flex gap-3">
										<a
											href="/messages?mentor={subscription.mentor_id}"
											class="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
										>
											<svg
												class="mr-2 h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
												/>
											</svg>
											Message Mentor
										</a>

										{#if subscription.status === 'active'}
											{#if subscription.cancel_at_period_end}
												<!-- Reactivate button -->
												<form 
													method="POST" 
													action="?/reactivateSubscription" 
													use:enhance={() => {
														reactivatingId = subscription.id
														return async ({ update }) => {
															await update()
															reactivatingId = null
														}
													}}
												>
													<input type="hidden" name="subscription_id" value={subscription.id} />
													<button
														type="submit"
														disabled={reactivatingId === subscription.id}
														class="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-300"
													>
														{reactivatingId === subscription.id ? 'Reactivating...' : 'Reactivate'}
													</button>
												</form>
											{:else}
												<!-- Cancel button -->
												<form 
													method="POST" 
													action="?/cancelSubscription" 
													use:enhance={() => {
														if (
															!confirm(
																'Are you sure you want to cancel? You will retain access until the end of your billing period.'
															)
														) {
															return async ({ update }) => {
																// Don't proceed
															}
														}
														cancellingId = subscription.id
														return async ({ update }) => {
															await update()
															cancellingId = null
														}
													}}
												>
													<input type="hidden" name="subscription_id" value={subscription.id} />
													<button
														type="submit"
														disabled={cancellingId === subscription.id}
														class="inline-flex items-center rounded-lg border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:bg-gray-300"
													>
														{cancellingId === subscription.id ? 'Cancelling...' : 'Cancel Subscription'}
													</button>
												</form>
											{/if}
										{/if}
									</div>
								</div>
							</div>
						</div>

						<!-- Right: Status Badge -->
						<div class="ml-4 flex flex-col items-end space-y-2">
							<span
								class={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(subscription.status)}`}
							>
								{subscription.status}
							</span>
							{#if subscription.created_at}
								<span class="text-xs text-gray-500">
									Since {formatDate(subscription.created_at)}
								</span>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
