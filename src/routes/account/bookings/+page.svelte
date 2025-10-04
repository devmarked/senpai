<script lang="ts">
	import type { PageData } from './$types'

	let { data }: { data: PageData } = $props()

	let activeTab = $state<'upcoming' | 'past' | 'cancelled'>('upcoming')

	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	const getStatusBadgeClass = (status: string | null) => {
		switch (status) {
			case 'confirmed':
				return 'bg-green-100 text-green-800'
			case 'pending':
				return 'bg-yellow-100 text-yellow-800'
			case 'completed':
				return 'bg-blue-100 text-blue-800'
			case 'cancelled':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}

	const getPaymentStatusBadgeClass = (status: string | null) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800'
			case 'pending':
				return 'bg-yellow-100 text-yellow-800'
			case 'failed':
				return 'bg-red-100 text-red-800'
			default:
				return 'bg-gray-100 text-gray-800'
		}
	}
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
					<h3 class="font-semibold text-green-900">Booking Confirmed!</h3>
					<p class="text-sm text-green-700">
						Your session has been booked and payment is confirmed. Check your email for details.
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold">My Bookings</h1>
		<p class="mt-2 text-gray-600">View and manage your mentorship sessions</p>
	</div>

	<!-- Tabs -->
	<div class="mb-6 border-b border-gray-200">
		<nav class="-mb-px flex space-x-8">
			<button
				onclick={() => (activeTab = 'upcoming')}
				class={`border-b-2 px-1 py-4 text-sm font-medium ${
					activeTab === 'upcoming'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
				}`}
			>
				Upcoming ({data.upcoming.length})
			</button>
			<button
				onclick={() => (activeTab = 'past')}
				class={`border-b-2 px-1 py-4 text-sm font-medium ${
					activeTab === 'past'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
				}`}
			>
				Past ({data.past.length})
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

	<!-- Bookings List -->
	<div class="space-y-4">
		{#if activeTab === 'upcoming' && data.upcoming.length === 0}
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
						d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
				<h3 class="mt-4 text-lg font-medium text-gray-900">No upcoming sessions</h3>
				<p class="mt-2 text-sm text-gray-500">Book a session with a mentor to get started!</p>
				<a
					href="/mentors"
					class="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
				>
					Browse Mentors
				</a>
			</div>
		{:else}
			{@const sessions =
				activeTab === 'upcoming'
					? data.upcoming
					: activeTab === 'past'
						? data.past
						: data.cancelled}

			{#each sessions as session}
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<div class="flex items-start justify-between">
						<!-- Left: Session Info -->
						<div class="flex-1">
							<div class="flex items-start space-x-4">
								<!-- Mentor Avatar -->
								<a href="/mentors/{session.mentor.slug}" class="flex-shrink-0">
									{#if session.mentor.avatar_url}
										<img
											src={session.mentor.avatar_url}
											alt={session.mentor.full_name}
											class="h-16 w-16 rounded-full object-cover"
										/>
									{:else}
										<div
											class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300"
										>
											<span class="text-xl font-semibold text-gray-600">
												{session.mentor.full_name?.charAt(0)}
											</span>
										</div>
									{/if}
								</a>

								<!-- Session Details -->
								<div class="flex-1">
									<div class="mb-2 flex items-start justify-between">
										<div>
											<h3 class="text-lg font-semibold">{session.title}</h3>
											<a
												href="/mentors/{session.mentor.slug}"
												class="text-sm text-gray-600 hover:text-blue-600"
											>
												with {session.mentor.full_name}
											</a>
										</div>
									</div>

									<div class="space-y-1 text-sm text-gray-600">
										<p>
											<strong>Date:</strong>
											{formatDate(session.scheduled_at)}
										</p>
										<p>
											<strong>Duration:</strong>
											{session.duration_minutes} minutes
										</p>
										<p>
											<strong>Type:</strong>
											{session.session_type}
										</p>
										<p>
											<strong>Price:</strong>
											${session.price_paid?.toFixed(2)}
											{session.currency?.toUpperCase()}
										</p>
									</div>

									{#if session.mentee_notes}
										<div class="mt-3 rounded bg-gray-50 p-3">
											<p class="text-xs font-medium text-gray-700">Your Notes:</p>
											<p class="mt-1 text-sm text-gray-600">{session.mentee_notes}</p>
										</div>
									{/if}

									{#if session.meeting_url}
										<div class="mt-4">
											<a
												href={session.meeting_url}
												target="_blank"
												rel="noopener noreferrer"
												class="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
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
														d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
													/>
												</svg>
												Join Meeting
											</a>
										</div>
									{/if}
								</div>
							</div>
						</div>

						<!-- Right: Status Badges -->
						<div class="ml-4 flex flex-col items-end space-y-2">
							<span
								class={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(session.status)}`}
							>
								{session.status}
							</span>
							<span
								class={`rounded-full px-3 py-1 text-xs font-medium ${getPaymentStatusBadgeClass(session.payment_status)}`}
							>
								{session.payment_status}
							</span>
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

