// src/hooks.server.ts
import { createServerClient } from '@supabase/ssr'
import { type Handle, redirect } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

const supabase: Handle = async ({ event, resolve }) => {
  /**
   * Creates a Supabase client specific to this server request.
   *
   * The Supabase client gets the Auth token from the request cookies.
   */
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => event.cookies.getAll(),
      /**
       * SvelteKit's cookies API requires `path` to be explicitly set in
       * the cookie options. Setting `path` to `/` replicates previous/
       * standard behavior.
       */
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) => {
          event.cookies.set(name, value, { ...options, path: '/' })
        })
      },
    },
  })

  /**
   * Validates the user's session by calling getUser() which verifies the JWT.
   * This is the secure way to check authentication on the server.
   * We don't call getSession() to avoid triggering security warnings.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { user },
      error,
    } = await event.locals.supabase.auth.getUser()
    
    if (error || !user) {
      return { user: null }
    }

    return { user }
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      /**
       * Supabase libraries use the `content-range` and `x-supabase-api-version`
       * headers, so we need to tell SvelteKit to pass it through.
       */
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
}

const authGuard: Handle = async ({ event, resolve }) => {
  const { user } = await event.locals.safeGetSession()
  event.locals.user = user

  // Protected routes that require authentication
  if (!event.locals.user && event.url.pathname.startsWith('/account')) {
    redirect(303, '/auth/login')
  }

  // Redirect authenticated users away from auth pages
  if (event.locals.user && event.url.pathname.startsWith('/auth')) {
    redirect(303, '/account')
  }

  // Mentor-only routes (must match exactly /account/mentor or /account/mentor/...)
  const isMentorRoute = event.url.pathname === '/account/mentor' || 
                        event.url.pathname.startsWith('/account/mentor/')
  
  if (isMentorRoute) {
    if (!event.locals.user) {
      redirect(303, '/auth/login')
    }

    // Check if user has mentor role
    // User is guaranteed to exist here due to check above
    const { data: profile } = await event.locals.supabase
      .from('profiles')
      .select('role')
      .eq('id', event.locals.user!.id)
      .single()

    if (profile?.role !== 'mentor' && profile?.role !== 'both') {
      redirect(303, '/account')
    }
  }

  return resolve(event)
}

export const handle: Handle = sequence(supabase, authGuard)

