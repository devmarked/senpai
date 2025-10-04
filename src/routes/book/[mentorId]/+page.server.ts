// src/routes/book/[mentorId]/+page.server.ts
import { error, fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const { supabase } = locals

	if (!locals.user) {
		throw redirect(303, `/auth/login?redirectTo=${url.pathname}`)
	}

	// Fetch mentor details
	const { data: mentor, error: mentorError } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', params.mentorId)
		.in('role', ['mentor', 'both'])
		.single()

	if (mentorError || !mentor) {
		throw error(404, 'Mentor not found')
	}

	// Prevent subscribing to yourself
	if (mentor.id === locals.user.id) {
		throw error(400, 'You cannot subscribe to yourself')
	}

	// Check if user already has an active subscription with this mentor
	const { data: existingSubscription } = await supabase
		.from('subscriptions')
		.select('*')
		.eq('mentor_id', mentor.id)
		.eq('mentee_id', locals.user.id)
		.eq('status', 'active')
		.single()

	return {
		mentor,
		existingSubscription
	}
}

export const actions = {
	default: async ({ request, params, locals }) => {
		const { supabase } = locals

		if (!locals.user) {
			return fail(401, { error: 'You must be logged in to subscribe' })
		}

		// Fetch mentor to get pricing
		const { data: mentor, error: mentorError } = await supabase
			.from('profiles')
			.select('monthly_rate, full_name, email')
			.eq('id', params.mentorId)
			.single()

		if (mentorError || !mentor) {
			return fail(404, { error: 'Mentor not found' })
		}

		const monthlyRate = mentor.monthly_rate || 0

		if (monthlyRate <= 0) {
			return fail(400, { error: 'This mentor has not set up their pricing yet' })
		}

		// Check for existing active subscription
		const { data: existingSubscription } = await supabase
			.from('subscriptions')
			.select('*')
			.eq('mentor_id', params.mentorId)
			.eq('mentee_id', locals.user.id)
			.eq('status', 'active')
			.single()

		if (existingSubscription) {
			return fail(400, { error: 'You already have an active subscription with this mentor' })
		}

		// Create pending subscription (will be activated after payment)
		const { data: subscription, error: subscriptionError } = await supabase
			.from('subscriptions')
			.insert({
				mentor_id: params.mentorId,
				mentee_id: locals.user.id,
				monthly_price: monthlyRate,
				currency: 'usd',
				status: 'pending'
			})
			.select()
			.single()

		if (subscriptionError || !subscription) {
			console.error('Subscription creation error:', subscriptionError)
			return fail(500, { error: 'Failed to create subscription. Please try again.' })
		}

		// Redirect to checkout API which will create Stripe subscription
		throw redirect(303, `/api/checkout/subscription?subscriptionId=${subscription.id}`)
	}
} satisfies Actions
