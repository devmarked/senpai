// src/routes/api/checkout/+server.ts
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

	const sessionId = url.searchParams.get('sessionId')

	if (!sessionId) {
		throw error(400, 'Session ID is required')
	}

	// Fetch session details
	const { data: session, error: sessionError } = await supabase
		.from('sessions')
		.select(
			`
			*,
			mentor:profiles!sessions_mentor_id_fkey(full_name, email),
			mentee:profiles!sessions_mentee_id_fkey(full_name, email)
		`
		)
		.eq('id', sessionId)
		.single()

	if (sessionError || !session) {
		throw error(404, 'Session not found')
	}

	// Verify the user is the mentee
	if (session.mentee_id !== locals.user.id) {
		throw error(403, 'Forbidden')
	}

	// Calculate amount in cents
	const amountInCents = Math.round((session.price_paid || 0) * 100)

	try {
		// Create Stripe Checkout Session
		const checkoutSession = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: session.currency || 'usd',
						product_data: {
							name: session.title,
							description: `${session.duration_minutes} min ${session.session_type} session with ${session.mentor.full_name}`,
							metadata: {
								session_id: session.id,
								mentor_id: session.mentor_id,
								mentee_id: session.mentee_id
							}
						},
						unit_amount: amountInCents
					},
					quantity: 1
				}
			],
			mode: 'payment',
			success_url: `${PUBLIC_BASE_URL}/account/bookings?session_id={CHECKOUT_SESSION_ID}&success=true`,
			cancel_url: `${PUBLIC_BASE_URL}/book/${session.mentor_id}?canceled=true`,
			metadata: {
				session_id: session.id,
				mentor_id: session.mentor_id,
				mentee_id: session.mentee_id
			},
			customer_email: session.mentee.email || undefined
		})

		// Update session with Stripe checkout session ID
		await supabase
			.from('sessions')
			.update({ stripe_session_id: checkoutSession.id })
			.eq('id', session.id)

		// Redirect to Stripe Checkout
		throw redirect(303, checkoutSession.url || '/')
	} catch (err) {
		console.error('Stripe checkout error:', err)
		throw error(500, 'Failed to create checkout session')
	}
}

