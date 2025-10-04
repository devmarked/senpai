// src/routes/api/checkout/subscription/+server.ts
import { error, redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import Stripe from 'stripe'
import { STRIPE_SECRET_KEY } from '$env/static/private'
import { PUBLIC_BASE_URL } from '$env/static/public'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2025-09-30.clover'
})

export const GET: RequestHandler = async ({ url, locals }) => {
	const { supabase } = locals

	if (!locals.user) {
		throw error(401, 'Unauthorized')
	}

	const subscriptionId = url.searchParams.get('subscriptionId')

	if (!subscriptionId) {
		throw error(400, 'Subscription ID is required')
	}

	// Fetch subscription details
	const { data: subscription, error: subscriptionError } = await supabase
		.from('subscriptions')
		.select(
			`
			*,
			mentor:profiles!subscriptions_mentor_id_fkey(full_name, email, stripe_product_id, stripe_price_id),
			mentee:profiles!subscriptions_mentee_id_fkey(full_name, email)
		`
		)
		.eq('id', subscriptionId)
		.single()

	if (subscriptionError || !subscription) {
		throw error(404, 'Subscription not found')
	}

	// Verify the user is the mentee
	if (subscription.mentee_id !== locals.user.id) {
		throw error(403, 'Forbidden')
	}

	// Calculate amount in cents
	const amountInCents = Math.round((subscription.monthly_price || 0) * 100)

	try {
		// If mentor doesn't have Stripe product/price set up, create them
		let priceId = subscription.mentor.stripe_price_id
		let productId = subscription.mentor.stripe_product_id

		if (!productId || !priceId) {
			// Create Stripe product for this mentor
			const product = await stripe.products.create({
				name: `Monthly Mentorship with ${subscription.mentor.full_name}`,
				description: `Unlimited mentorship sessions with ${subscription.mentor.full_name}`,
				metadata: {
					mentor_id: subscription.mentor_id
				}
			})

			// Create Stripe price for monthly subscription
			const price = await stripe.prices.create({
				product: product.id,
				unit_amount: amountInCents,
				currency: subscription.currency || 'usd',
				recurring: {
					interval: 'month'
				},
				metadata: {
					mentor_id: subscription.mentor_id
				}
			})

			// Save to mentor profile
			await supabase
				.from('profiles')
				.update({
					stripe_product_id: product.id,
					stripe_price_id: price.id
				})
				.eq('id', subscription.mentor_id)

			priceId = price.id
			productId = product.id
		}

		// Create Stripe Checkout Session for subscription
		const checkoutSession = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price: priceId,
					quantity: 1
				}
			],
			mode: 'subscription',
			success_url: `${PUBLIC_BASE_URL}/account/subscriptions?session_id={CHECKOUT_SESSION_ID}&success=true`,
			cancel_url: `${PUBLIC_BASE_URL}/book/${subscription.mentor_id}?canceled=true`,
			metadata: {
				subscription_id: subscription.id,
				mentor_id: subscription.mentor_id,
				mentee_id: subscription.mentee_id
			},
			subscription_data: {
				metadata: {
					subscription_id: subscription.id,
					mentor_id: subscription.mentor_id,
					mentee_id: subscription.mentee_id
				}
			},
			customer_email: subscription.mentee.email || undefined
		})

		// Update subscription with Stripe session info
		await supabase
			.from('subscriptions')
			.update({
				stripe_product_id: productId,
				stripe_price_id: priceId
			})
			.eq('id', subscription.id)

		// Redirect to Stripe Checkout
		throw redirect(303, checkoutSession.url || '/')
	} catch (err) {
		// Re-throw if it's a redirect (SvelteKit redirects are thrown, not errors)
		if (err && typeof err === 'object' && 'status' in err && err.status === 303) {
			throw err
		}
		console.error('Stripe checkout error:', err)
		throw error(500, 'Failed to create checkout session')
	}
}

