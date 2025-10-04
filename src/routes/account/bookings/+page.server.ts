// src/routes/account/bookings/+page.server.ts
import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, url }) => {
	const { supabase, user } = locals

	if (!user) {
		throw redirect(303, `/auth/login?redirectTo=${url.pathname}`)
	}

	// Check for success message from Stripe
	const success = url.searchParams.get('success')
	const stripeSessionId = url.searchParams.get('session_id')

	// Fetch user's bookings (as mentee)
	const { data: bookings, error: bookingsError } = await supabase
		.from('sessions')
		.select(
			`
			*,
			mentor:profiles!sessions_mentor_id_fkey(full_name, avatar_url, slug, email)
		`
		)
		.eq('mentee_id', user.id)
		.order('scheduled_at', { ascending: false })

	if (bookingsError) {
		console.error('Error fetching bookings:', bookingsError)
	}

	// Separate bookings by status
	const upcoming = bookings?.filter((b) => {
		const scheduledAt = new Date(b.scheduled_at)
		return (
			scheduledAt > new Date() && (b.status === 'confirmed' || b.status === 'pending')
		)
	})

	const past = bookings?.filter((b) => {
		const scheduledAt = new Date(b.scheduled_at)
		return scheduledAt <= new Date() || b.status === 'completed'
	})

	const cancelled = bookings?.filter((b) => b.status === 'cancelled')

	return {
		bookings: bookings || [],
		upcoming: upcoming || [],
		past: past || [],
		cancelled: cancelled || [],
		success: success === 'true',
		stripeSessionId
	}
}

