// src/routes/account/subscriptions/+page.server.ts
import { redirect, fail } from '@sveltejs/kit'
import type { PageServerLoad, Actions } from './$types'
import Stripe from 'stripe'
import { STRIPE_SECRET_KEY } from '$env/static/private'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2025-09-30.clover'
})

export const load: PageServerLoad = async ({ locals, url }) => {
	const { supabase, user } = locals

	if (!user) {
		throw redirect(303, `/auth/login?redirectTo=${url.pathname}`)
	}

	// Check for success message from Stripe
	const success = url.searchParams.get('success')
	const stripeSessionId = url.searchParams.get('session_id')

	// Fetch user's subscriptions (as mentee)
	const { data: subscriptions, error: subscriptionsError } = await supabase
		.from('subscriptions')
		.select(
			`
			*,
			mentor:profiles!subscriptions_mentor_id_fkey(full_name, avatar_url, slug, email, topics)
		`
		)
		.eq('mentee_id', user.id)
		.order('created_at', { ascending: false })

	if (subscriptionsError) {
		console.error('Error fetching subscriptions:', subscriptionsError)
	}

	// Separate subscriptions by status
	const active = subscriptions?.filter((s) => s.status === 'active') || []
	const pastDue = subscriptions?.filter((s) => s.status === 'past_due') || []
	const cancelled = subscriptions?.filter((s) => s.status === 'cancelled') || []

	return {
		subscriptions: subscriptions || [],
		active,
		pastDue,
		cancelled,
		success: success === 'true',
		stripeSessionId
	}
}

export const actions = {
	cancelSubscription: async ({ request, locals }) => {
		const { supabase, user } = locals

		if (!user) {
			return fail(401, { error: 'Unauthorized' })
		}

		const formData = await request.formData()
		const subscriptionId = formData.get('subscription_id') as string

		if (!subscriptionId) {
			return fail(400, { error: 'Subscription ID is required' })
		}

		// Fetch subscription
		const { data: subscription, error: fetchError } = await supabase
			.from('subscriptions')
			.select('*')
			.eq('id', subscriptionId)
			.eq('mentee_id', user.id)
			.single()

		if (fetchError || !subscription) {
			return fail(404, { error: 'Subscription not found' })
		}

		if (subscription.status !== 'active') {
			return fail(400, { error: 'Subscription is not active' })
		}

		if (!subscription.stripe_subscription_id) {
			return fail(400, { error: 'No Stripe subscription ID found' })
		}

		try {
			// Cancel subscription at period end (so they keep access until billing period ends)
			await stripe.subscriptions.update(subscription.stripe_subscription_id, {
				cancel_at_period_end: true
			})

			// Update our database
			await supabase
				.from('subscriptions')
				.update({ cancel_at_period_end: true })
				.eq('id', subscriptionId)

			return { success: true, message: 'Subscription will be cancelled at the end of the billing period' }
		} catch (error) {
			console.error('Error cancelling subscription:', error)
			return fail(500, { error: 'Failed to cancel subscription' })
		}
	},

	reactivateSubscription: async ({ request, locals }) => {
		const { supabase, user } = locals

		if (!user) {
			return fail(401, { error: 'Unauthorized' })
		}

		const formData = await request.formData()
		const subscriptionId = formData.get('subscription_id') as string

		if (!subscriptionId) {
			return fail(400, { error: 'Subscription ID is required' })
		}

		// Fetch subscription
		const { data: subscription, error: fetchError } = await supabase
			.from('subscriptions')
			.select('*')
			.eq('id', subscriptionId)
			.eq('mentee_id', user.id)
			.single()

		if (fetchError || !subscription) {
			return fail(404, { error: 'Subscription not found' })
		}

		if (!subscription.cancel_at_period_end) {
			return fail(400, { error: 'Subscription is not scheduled for cancellation' })
		}

		if (!subscription.stripe_subscription_id) {
			return fail(400, { error: 'No Stripe subscription ID found' })
		}

		try {
			// Re-enable subscription
			await stripe.subscriptions.update(subscription.stripe_subscription_id, {
				cancel_at_period_end: false
			})

			// Update our database
			await supabase
				.from('subscriptions')
				.update({ cancel_at_period_end: false })
				.eq('id', subscriptionId)

			return { success: true, message: 'Subscription reactivated successfully' }
		} catch (error) {
			console.error('Error reactivating subscription:', error)
			return fail(500, { error: 'Failed to reactivate subscription' })
		}
	}
} satisfies Actions

