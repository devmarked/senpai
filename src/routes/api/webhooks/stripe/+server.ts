// src/routes/api/webhooks/stripe/+server.ts
import { error, json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import Stripe from 'stripe'
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '$env/static/private'
import { createClient } from '@supabase/supabase-js'
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private'
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import type { Database } from '$lib/types/database.types'

const stripe = new Stripe(STRIPE_SECRET_KEY, {
	apiVersion: '2025-09-30.clover'
})

// Use service role client for webhook operations (bypasses RLS)
const supabaseAdmin = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Handle GET requests (for testing/health checks)
export const GET: RequestHandler = async () => {
	return json({ message: 'Stripe webhook endpoint is active' })
}

export const POST: RequestHandler = async ({ request }) => {
	console.log('Webhook received:', request.method, request.url)
	
	const body = await request.text()
	const signature = request.headers.get('stripe-signature')

	if (!signature) {
		console.error('Missing stripe-signature header')
		throw error(400, 'Missing stripe-signature header')
	}

	let event: Stripe.Event

	try {
		event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
		console.log('Webhook event verified:', event.type, event.id)
	} catch (err) {
		console.error('Webhook signature verification failed:', err)
		throw error(400, 'Invalid signature')
	}

	// Handle different event types
	try {
		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Stripe.Checkout.Session
				console.log('Processing checkout.session.completed:', session.id, 'mode:', session.mode)
				if (session.mode === 'subscription') {
					await handleSubscriptionCheckoutCompleted(session)
				}
				break
			}

			case 'customer.subscription.created': {
				const subscription = event.data.object as Stripe.Subscription
				console.log('Processing customer.subscription.created:', subscription.id)
				await handleSubscriptionCreated(subscription)
				break
			}

			case 'customer.subscription.updated': {
				const subscription = event.data.object as Stripe.Subscription
				console.log('Processing customer.subscription.updated:', subscription.id)
				await handleSubscriptionUpdated(subscription)
				break
			}

			case 'customer.subscription.deleted': {
				const subscription = event.data.object as Stripe.Subscription
				console.log('Processing customer.subscription.deleted:', subscription.id)
				await handleSubscriptionDeleted(subscription)
				break
			}

			case 'invoice.payment_succeeded': {
				const invoice = event.data.object as Stripe.Invoice
				console.log('Processing invoice.payment_succeeded:', invoice.id)
				await handleInvoicePaymentSucceeded(invoice)
				break
			}

			case 'invoice.payment_failed': {
				const invoice = event.data.object as Stripe.Invoice
				console.log('Processing invoice.payment_failed:', invoice.id)
				await handleInvoicePaymentFailed(invoice)
				break
			}

			// Informational events we can ignore
			case 'product.created':
			case 'product.updated':
			case 'price.created':
			case 'price.updated':
			case 'plan.created':
			case 'plan.updated':
				console.log('Ignoring informational event:', event.type)
				// These events are sent when products/prices are created
				// No action needed - they're automatically handled
				break

			default:
				console.log(`Unhandled event type: ${event.type}`)
		}

		console.log('Webhook processed successfully:', event.type, event.id)
		return json({ received: true })
	} catch (err) {
		console.error('Error processing webhook event:', event.type, err)
		// Still return 200 to acknowledge receipt - Stripe will retry failed events
		return json({ received: true, error: 'Processing error' })
	}
}

async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
	const subscriptionId = session.metadata?.subscription_id
	const stripeSubscriptionId = session.subscription as string

	if (!subscriptionId) {
		console.error('No subscription_id in metadata')
		return
	}

	// Fetch the Stripe subscription to get full details
	const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)

	// Extract billing period dates from subscription items
	const currentPeriodStart = (stripeSubscription as any).current_period_start
		? new Date((stripeSubscription as any).current_period_start * 1000).toISOString()
		: null

	const currentPeriodEnd = (stripeSubscription as any).current_period_end
		? new Date((stripeSubscription as any).current_period_end * 1000).toISOString()
		: null

	const trialEnd = (stripeSubscription as any).trial_end
		? new Date((stripeSubscription as any).trial_end * 1000).toISOString()
		: null

	// Update our subscription record
	const { error: updateError } = await supabaseAdmin
		.from('subscriptions')
		.update({
			status: 'active',
			stripe_subscription_id: stripeSubscriptionId,
			stripe_customer_id: stripeSubscription.customer as string,
			current_period_start: currentPeriodStart,
			current_period_end: currentPeriodEnd,
			trial_end: trialEnd
		})
		.eq('id', subscriptionId)

	if (updateError) {
		console.error('Failed to update subscription:', updateError)
		return
	}

	console.log(`Subscription ${subscriptionId} activated`)

	// TODO: Send welcome email to mentee
	// TODO: Notify mentor of new subscriber
}

async function handleSubscriptionCreated(stripeSubscription: Stripe.Subscription) {
	const subscriptionId = stripeSubscription.metadata?.subscription_id

	if (!subscriptionId) {
		console.log('No subscription_id in metadata, skipping')
		return
	}

	// Extract billing periods with type assertion
	const currentPeriodStart = (stripeSubscription as any).current_period_start
		? new Date((stripeSubscription as any).current_period_start * 1000).toISOString()
		: null

	const currentPeriodEnd = (stripeSubscription as any).current_period_end
		? new Date((stripeSubscription as any).current_period_end * 1000).toISOString()
		: null

	// Update subscription with Stripe details
	const { data: updatedSubscription, error: updateError } = await supabaseAdmin
		.from('subscriptions')
		.update({
			status: 'active',
			stripe_subscription_id: stripeSubscription.id,
			stripe_customer_id: stripeSubscription.customer as string,
			current_period_start: currentPeriodStart,
			current_period_end: currentPeriodEnd
		})
		.eq('id', subscriptionId)
		.select('id, mentor_id, mentee_id')
		.single()

	if (updateError) {
		console.error('Failed to update subscription:', updateError)
		return
	}

	// Auto-create mentorship for new active subscription
	if (updatedSubscription) {
		const { error: mentorshipError } = await supabaseAdmin
			.from('mentorships')
			.insert({
				subscription_id: updatedSubscription.id,
				mentor_id: updatedSubscription.mentor_id,
				mentee_id: updatedSubscription.mentee_id,
				status: 'active',
				title: 'Mentorship Program'
			})
			.select()
			.single()

		if (mentorshipError && mentorshipError.code !== '23505') { // Ignore duplicate errors
			console.error('Failed to create mentorship:', mentorshipError)
		} else {
			console.log(`Mentorship created for new subscription ${updatedSubscription.id}`)
		}
	}
}

async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
	// Find subscription by Stripe subscription ID
	const { data: subscription, error: findError } = await supabaseAdmin
		.from('subscriptions')
		.select('id, mentor_id, mentee_id')
		.eq('stripe_subscription_id', stripeSubscription.id)
		.single()

	if (findError || !subscription) {
		console.log('Subscription not found for Stripe subscription:', stripeSubscription.id)
		return
	}

	// Map Stripe status to our status
	let status = 'active'
	if (stripeSubscription.status === 'canceled' || stripeSubscription.status === 'unpaid') {
		status = 'cancelled'
	} else if (stripeSubscription.status === 'past_due') {
		status = 'past_due'
	} else if (stripeSubscription.status === 'paused') {
		status = 'paused'
	}

	// Extract billing periods with type assertion
	const currentPeriodStart = (stripeSubscription as any).current_period_start
		? new Date((stripeSubscription as any).current_period_start * 1000).toISOString()
		: null

	const currentPeriodEnd = (stripeSubscription as any).current_period_end
		? new Date((stripeSubscription as any).current_period_end * 1000).toISOString()
		: null

	const canceledAt = (stripeSubscription as any).canceled_at
		? new Date((stripeSubscription as any).canceled_at * 1000).toISOString()
		: null

	// Update subscription
	const { error: updateError } = await supabaseAdmin
		.from('subscriptions')
		.update({
			status,
			current_period_start: currentPeriodStart,
			current_period_end: currentPeriodEnd,
			cancel_at_period_end: (stripeSubscription as any).cancel_at_period_end || false,
			cancelled_at: canceledAt
		})
		.eq('id', subscription.id)

	if (updateError) {
		console.error('Failed to update subscription:', updateError)
		return
	}

	console.log(`Subscription ${subscription.id} updated to status: ${status}`)

	// Auto-create mentorship when subscription becomes active
	if (status === 'active') {
		const { error: mentorshipError } = await supabaseAdmin
			.from('mentorships')
			.insert({
				subscription_id: subscription.id,
				mentor_id: subscription.mentor_id,
				mentee_id: subscription.mentee_id,
				status: 'active',
				title: 'Mentorship Program'
			})
			.select()
			.single()

		if (mentorshipError && mentorshipError.code !== '23505') { // Ignore duplicate errors
			console.error('Failed to create mentorship:', mentorshipError)
		} else {
			console.log(`Mentorship created for subscription ${subscription.id}`)
		}
	}
}

async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
	// Find subscription by Stripe subscription ID
	const { data: subscription, error: findError } = await supabaseAdmin
		.from('subscriptions')
		.select('id')
		.eq('stripe_subscription_id', stripeSubscription.id)
		.single()

	if (findError || !subscription) {
		console.log('Subscription not found for Stripe subscription:', stripeSubscription.id)
		return
	}

	// Mark subscription as cancelled
	const { error: updateError } = await supabaseAdmin
		.from('subscriptions')
		.update({
			status: 'cancelled',
			cancelled_at: new Date().toISOString()
		})
		.eq('id', subscription.id)

	if (updateError) {
		console.error('Failed to cancel subscription:', updateError)
		return
	}

	console.log(`Subscription ${subscription.id} cancelled`)

	// TODO: Send cancellation confirmation email
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
	const subscriptionId = (invoice as any).subscription || null

	if (!subscriptionId) {
		return
	}

	// Find our subscription
	const { data: subscription } = await supabaseAdmin
		.from('subscriptions')
		.select('id')
		.eq('stripe_subscription_id', typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id)
		.single()

	if (subscription) {
		console.log(`Invoice payment succeeded for subscription ${subscription.id}`)
		// TODO: Send payment receipt email
	}
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
	const subscriptionId = (invoice as any).subscription || null

	if (!subscriptionId) {
		return
	}

	// Find our subscription
	const { data: subscription } = await supabaseAdmin
		.from('subscriptions')
		.select('id')
		.eq('stripe_subscription_id', typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id)
		.single()

	if (subscription) {
		// Update status to past_due
		await supabaseAdmin
			.from('subscriptions')
			.update({ status: 'past_due' })
			.eq('id', subscription.id)

		console.log(`Invoice payment failed for subscription ${subscription.id}`)
		// TODO: Send payment failure notification email
	}
}
