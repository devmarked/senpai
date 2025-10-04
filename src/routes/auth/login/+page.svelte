<script lang="ts">
  import { enhance } from '$app/forms'
  import type { ActionData } from './$types'

  let { form }: { form: ActionData } = $props()
  let loading = $state(false)
</script>

<div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style="background-color: #f9f1dd;">
  <div class="max-w-md w-full">
    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8 shadow-xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="mb-4">
          <span class="text-red-500 font-bold text-sm tracking-wider uppercase">
            Welcome Back
          </span>
        </div>
        <h2 class="text-4xl font-bold text-gray-900 mb-3">
          Sign in to SenpAI
        </h2>
        <p class="text-gray-800">
          Sign in via magic link with your email below
        </p>
      </div>

      <!-- Message Alert -->
      {#if form?.message}
        <div class="rounded-2xl p-4 mb-6 border-2 {form?.success ? 'bg-green-100 text-green-800 border-green-600' : 'bg-red-100 text-red-800 border-red-600'}">
          <p class="text-sm font-semibold">{form.message}</p>
        </div>
      {/if}

      <!-- Form -->
      <form
        method="POST"
        class="space-y-6"
        use:enhance={() => {
          loading = true
          return async ({ update }) => {
            await update()
            loading = false
          }
        }}
      >
        <div>
          <label for="email" class="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="appearance-none block w-full px-4 py-3 border-2 border-gray-900 bg-white/60 placeholder-gray-600 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
            placeholder="your@email.com"
            value={form?.email ?? ''}
          />
        </div>

        {#if form?.errors?.email}
          <p class="text-red-600 text-sm font-semibold">{form.errors.email}</p>
        {/if}

        <div>
          <button
            type="submit"
            disabled={loading}
            class="w-full flex justify-center py-3.5 px-6 border-2 border-gray-900 text-base font-bold rounded-full text-white bg-gray-900 hover:bg-red-600 hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 uppercase tracking-wide"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
        </div>
      </form>

      <!-- Footer Note -->
      <div class="mt-6 pt-6 border-t-2 border-gray-900/20">
        <p class="text-center text-xs text-gray-700">
          We'll send you a secure link to sign in without a password
        </p>
      </div>
    </div>
  </div>
</div>

