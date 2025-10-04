// src/routes/mentors/+page.server.ts
import { getMentors } from '$lib/server/db'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals, url, setHeaders }) => {
	const { supabase } = locals

	// Extract query params for filtering
	const search = url.searchParams.get('search') || undefined
	const topicsParam = url.searchParams.get('topics')
	const topics = topicsParam ? topicsParam.split(',') : undefined
	const experienceLevel = url.searchParams.get('level') || undefined
	const availableOnly = url.searchParams.get('available') === 'true'

	// Fetch mentors with filters
	const mentors = await getMentors(supabase, {
		search,
		topics,
		experienceLevel,
		isAvailable: availableOnly ? true : undefined
	})

	// Cache for 60 seconds - good for SEO and performance
	setHeaders({
		'cache-control': 'public, max-age=60'
	})

	return {
		mentors,
		filters: {
			search,
			topics,
			experienceLevel,
			availableOnly
		}
	}
}

