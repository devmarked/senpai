<script lang="ts">
  import { enhance } from '$app/forms'
  import type { PageData, ActionData } from './$types'

  let { data, form } = $props<{ data: PageData; form: ActionData }>()
  let { user, profile } = $derived(data)

  // Form state
  let isSubmitting = $state(false)
  let showSuccessMessage = $state(false)

  // Initialize form fields - use profile directly without $state to avoid warnings
  let full_name = $state('')
  let bio = $state('')
  let role = $state('mentee')
  let avatar_url = $state('')
  let experience_level = $state('')
  let topics = $state('')
  let languages_spoken = $state('')
  let monthly_rate = $state('')
  let is_available = $state(true)

  // Initialize values from profile
  $effect(() => {
    if (profile) {
      full_name = profile.full_name || ''
      bio = profile.bio || ''
      role = profile.role || 'mentee'
      avatar_url = profile.avatar_url || ''
      experience_level = profile.experience_level || ''
      topics = profile.topics?.join(', ') || ''
      languages_spoken = profile.languages_spoken?.join(', ') || ''
      monthly_rate = profile.monthly_rate?.toString() || ''
      is_available = profile.is_available ?? true
    }
  })

  // Watch for form submission result
  $effect(() => {
    if (form?.success) {
      showSuccessMessage = true
      setTimeout(() => {
        showSuccessMessage = false
      }, 3000)
    }
  })
</script>

<div class="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style="background-color: #f9f1dd;">
  <div class="max-w-4xl mx-auto">
    
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-4xl font-bold text-gray-900">
            My Profile ⚙️
          </h1>
          <p class="mt-2 text-gray-700 font-medium">Manage your personal information and settings</p>
        </div>
        <a 
          href="/account" 
          class="inline-flex items-center px-6 py-3 border-2 border-gray-900 rounded-full text-gray-900 font-bold text-sm hover:bg-gray-900 hover:text-white transition-all duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </a>
      </div>
    </div>

    <!-- Success Message -->
    {#if showSuccessMessage}
      <div class="mb-6 bg-green-50 border-2 border-green-500 rounded-2xl p-4 flex items-center gap-3">
        <svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-green-900 font-bold">{form?.message || 'Profile updated successfully!'}</p>
      </div>
    {/if}

    <!-- Error Message -->
    {#if form && !form.success && form.message}
      <div class="mb-6 bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex items-center gap-3">
        <svg class="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-900 font-bold">{form.message}</p>
      </div>
    {/if}

    <!-- Profile Form -->
    <div class="bg-white rounded-3xl border-2 border-gray-900 shadow-xl overflow-hidden">
      <form 
        method="POST" 
        action="?/updateProfile" 
        use:enhance={() => {
          isSubmitting = true
          return async ({ update }) => {
            await update()
            isSubmitting = false
          }
        }}
      >
        <!-- Basic Information Section -->
        <div class="px-8 py-6 border-b-2 border-gray-900 bg-gradient-to-br from-purple-50 to-pink-50">
          <h2 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">Basic Information</h2>
        </div>

        <div class="p-8 space-y-6">
          <!-- Full Name -->
          <div>
            <label for="full_name" class="block text-sm font-bold text-gray-900 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              bind:value={full_name}
              required
              class="w-full px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter your full name"
            />
          </div>

          <!-- Email (read-only) -->
          <div>
            <label for="email" class="block text-sm font-bold text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-600 font-medium bg-gray-100 cursor-not-allowed"
            />
            <p class="mt-1 text-xs text-gray-600">Email cannot be changed</p>
          </div>

          <!-- Avatar URL -->
          <div>
            <label for="avatar_url" class="block text-sm font-bold text-gray-900 mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              id="avatar_url"
              name="avatar_url"
              bind:value={avatar_url}
              class="w-full px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="https://example.com/avatar.jpg"
            />
            <p class="mt-1 text-xs text-gray-600">Enter a URL to your profile picture</p>
            {#if avatar_url}
              <div class="mt-3 flex items-center gap-3">
                <img 
                  src={avatar_url} 
                  alt="Avatar preview" 
                  class="w-16 h-16 rounded-full border-2 border-gray-900 object-cover"
                  onerror={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name || user.email || 'User')}`
                  }}
                />
                <p class="text-sm text-gray-600 font-medium">Preview</p>
              </div>
            {/if}
          </div>

          <!-- Bio -->
          <div>
            <label for="bio" class="block text-sm font-bold text-gray-900 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              bind:value={bio}
              rows="4"
              class="w-full px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>

          <!-- Role -->
          <div>
            <label for="role" class="block text-sm font-bold text-gray-900 mb-2">
              Role *
            </label>
            <select
              id="role"
              name="role"
              bind:value={role}
              required
              class="w-full px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="mentee">Mentee</option>
              <option value="mentor">Mentor</option>
              <option value="both">Both</option>
            </select>
            <p class="mt-1 text-xs text-gray-600">
              Choose "Mentor" or "Both" if you want to offer mentorship services
            </p>
          </div>
        </div>

        <!-- Mentor-Specific Information Section -->
        {#if role === 'mentor' || role === 'both'}
          <div class="px-8 py-6 border-y-2 border-gray-900 bg-gradient-to-br from-amber-50 to-orange-50">
            <h2 class="text-2xl font-bold text-gray-900 uppercase tracking-wide">Mentor Information</h2>
          </div>

          <div class="p-8 space-y-6">
            <!-- Experience Level -->
            <div>
              <label for="experience_level" class="block text-sm font-bold text-gray-900 mb-2">
                Experience Level
              </label>
              <select
                id="experience_level"
                name="experience_level"
                bind:value={experience_level}
                class="w-full px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <!-- Topics -->
            <div>
              <label for="topics" class="block text-sm font-bold text-gray-900 mb-2">
                Topics/Expertise
              </label>
              <input
                type="text"
                id="topics"
                name="topics"
                bind:value={topics}
                class="w-full px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Machine Learning, NLP, Computer Vision"
              />
              <p class="mt-1 text-xs text-gray-600">Separate topics with commas</p>
            </div>

            <!-- Languages Spoken -->
            <div>
              <label for="languages_spoken" class="block text-sm font-bold text-gray-900 mb-2">
                Languages Spoken
              </label>
              <input
                type="text"
                id="languages_spoken"
                name="languages_spoken"
                bind:value={languages_spoken}
                class="w-full px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., English, Spanish, French"
              />
              <p class="mt-1 text-xs text-gray-600">Separate languages with commas</p>
            </div>

            <!-- Monthly Rate -->
            <div>
              <label for="monthly_rate" class="block text-sm font-bold text-gray-900 mb-2">
                Monthly Subscription Rate ($)
              </label>
              <input
                type="number"
                id="monthly_rate"
                name="monthly_rate"
                bind:value={monthly_rate}
                min="0"
                step="0.01"
                class="w-full px-4 py-3 border-2 border-gray-900 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="99.00"
              />
              <p class="mt-1 text-xs text-gray-600">Your monthly mentorship subscription price</p>
            </div>

            <!-- Availability -->
            <div>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_available"
                  bind:checked={is_available}
                  value="true"
                  class="w-5 h-5 border-2 border-gray-900 rounded focus:ring-2 focus:ring-red-500 text-red-500"
                />
                <span class="text-sm font-bold text-gray-900">
                  Available for new mentees
                </span>
              </label>
              <p class="mt-1 ml-8 text-xs text-gray-600">
                Uncheck this if you're not accepting new mentees right now
              </p>
            </div>

            {#if profile?.slug}
              <div class="mt-6 bg-blue-50 border-2 border-blue-500 rounded-2xl p-4">
                <p class="text-sm text-gray-900 font-medium">
                  <strong>Your mentor profile:</strong> 
                  <a 
                    href="/mentors/{profile.slug}" 
                    target="_blank"
                    class="text-blue-600 hover:text-blue-800 underline"
                  >
                    /mentors/{profile.slug}
                  </a>
                </p>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Form Actions -->
        <div class="px-8 py-6 border-t-2 border-gray-900 bg-gray-50 flex justify-end gap-4">
          <a
            href="/account"
            class="px-8 py-3 border-2 border-gray-900 rounded-full text-gray-900 font-bold text-base hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={isSubmitting}
            class="px-8 py-3 bg-gray-900 border-2 border-gray-900 rounded-full text-white font-bold text-base hover:bg-red-500 hover:border-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>

    <!-- Danger Zone -->
    <div class="mt-8 bg-red-50 rounded-3xl border-2 border-red-500 shadow-xl overflow-hidden">
      <div class="px-8 py-6 border-b-2 border-red-500 bg-white/60">
        <h2 class="text-2xl font-bold text-red-600 uppercase tracking-wide">⚠️ Danger Zone</h2>
      </div>
      <div class="p-8">
        <p class="text-gray-700 font-medium mb-4">
          Need to delete your account or have other concerns? Contact our support team.
        </p>
        <a
          href="mailto:support@senpai.com"
          class="inline-flex items-center px-6 py-3 border-2 border-red-500 rounded-full text-red-600 font-bold text-sm hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          Contact Support
        </a>
      </div>
    </div>

  </div>
</div>

