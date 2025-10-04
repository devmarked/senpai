// src/routes/mentors/[slug]/+page.server.ts
import { error } from '@sveltejs/kit'
import { getMentorBySlug, getMentorReviews } from '$lib/server/db'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ params, locals, setHeaders }) => {
	const { supabase } = locals
	const { slug } = params

	try {
		// Fetch mentor profile
		const mentor = await getMentorBySlug(supabase, slug)

		// If mentor not found, throw 404
		if (!mentor) {
			throw error(404, 'Mentor not found')
		}

		// Fetch reviews
		const reviews = await getMentorReviews(supabase, mentor.id)

		// Cache for 60 seconds
		setHeaders({
			'cache-control': 'public, max-age=60'
		})

		return {
			mentor,
			reviews
		}
	} catch (err) {
		console.error('Error loading mentor profile:', err)
		throw error(404, 'Mentor not found')
	}
}
