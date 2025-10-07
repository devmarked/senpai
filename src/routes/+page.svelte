<script lang="ts">
  import { goto } from '$app/navigation'
  import senpAIMascot from '$lib/assets/senpAI.png'
  import senpAILogoWhite from '$lib/assets/senpai_logo_white.png'
  import aiBanner from '$lib/assets/ai_banner.png'

  function handleGetStarted() {
    goto('/auth/login')
  }

  function handleFindMentors() {
    goto('/mentors')
  }
</script>

<div class="min-h-screen" style="background-color: #f9f1dd;">
  <!-- Hero Section -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <div class="text-center mb-16">
      <div class="mb-6">
        <span class="text-red-500 font-bold text-sm tracking-wider uppercase">
          AI Mentorship Platform
        </span>
      </div>
      <h1 class="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
        Learn AI with Real Experts
      </h1>
      <p class="text-xl md:text-2xl text-gray-800 mb-8 max-w-3xl mx-auto">
        Connect with expert AI mentors for personalized 1:1 sessions, project guidance, and accelerated career growth
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4 mb-12">
        <button
          onclick={handleFindMentors}
          class="px-8 py-4 text-lg font-bold text-white bg-gray-900 rounded-full hover:bg-red-600 transition-colors duration-200 uppercase tracking-wide border-2 border-gray-900 hover:border-red-600"
        >
          Find your 
          <img src={senpAILogoWhite} alt="SenpAI Logo" class="inline-block w-30 h-10 ml-2 align-middle object-contain" />
        </button>
        <button
          onclick={handleGetStarted}
          class="px-8 py-4 text-lg font-bold text-gray-900 bg-white/60 rounded-full hover:bg-gray-900 hover:text-white transition-colors duration-200 uppercase tracking-wide border-2 border-gray-900"
        >
          Get Started Free
        </button>
      </div>

      <!-- Hero Image/Logo -->
      <div class="max-w-4xl mx-auto">
        <div class="p-8">
          <img src={aiBanner} alt="SenpAI" class="w-full h-auto" />
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8 text-center">
        <div class="text-5xl font-bold text-gray-900 mb-2">500+</div>
        <div class="text-gray-800 font-semibold uppercase tracking-wide">Expert Mentors</div>
      </div>
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8 text-center">
        <div class="text-5xl font-bold text-gray-900 mb-2">10K+</div>
        <div class="text-gray-800 font-semibold uppercase tracking-wide">Sessions Completed</div>
      </div>
      <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8 text-center">
        <div class="text-5xl font-bold text-gray-900 mb-2">4.9★</div>
        <div class="text-gray-800 font-semibold uppercase tracking-wide">Average Rating</div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="mb-20">
      <div class="text-center mb-12">
        <span class="text-red-500 font-bold text-sm tracking-wider uppercase mb-4 block">
          Why Choose SenpAI
        </span>
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Your Path to AI Mastery
        </h2>
        <p class="text-lg text-gray-800 max-w-2xl mx-auto">
          Get personalized guidance from industry experts in machine learning, data science, and AI development
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Feature 1 -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8">
          <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-wide">1:1 Sessions</h3>
          <p class="text-gray-800">
            Book personalized one-on-one sessions with expert AI mentors who understand your goals and challenges
          </p>
        </div>

        <!-- Feature 2 -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8">
          <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Verified Experts</h3>
          <p class="text-gray-800">
            All mentors are thoroughly vetted professionals with proven track records in AI and machine learning
          </p>
        </div>

        <!-- Feature 3 -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8">
          <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Flexible Scheduling</h3>
          <p class="text-gray-800">
            Book sessions that fit your schedule. Choose from various time slots and time zones
          </p>
        </div>

        <!-- Feature 4 -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8">
          <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Project Guidance</h3>
          <p class="text-gray-800">
            Get hands-on help with your AI projects, from concept to deployment and optimization
          </p>
        </div>

        <!-- Feature 5 -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8">
          <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Direct Messaging</h3>
          <p class="text-gray-800">
            Stay connected with your mentor through our integrated messaging system for ongoing support
          </p>
        </div>

        <!-- Feature 6 -->
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8">
          <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Fair Pricing</h3>
          <p class="text-gray-800">
            Transparent pricing with options for every budget. Pay only for the sessions you book
          </p>
        </div>
      </div>
    </div>

    <!-- How It Works Section -->
    <div class="mb-20">
      <div class="text-center mb-12">
        <span class="text-red-500 font-bold text-sm tracking-wider uppercase mb-4 block">
          Simple Process
        </span>
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          How It Works
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8 text-center">
          <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-3xl font-bold text-white">1</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Browse Mentors</h3>
          <p class="text-gray-800">
            Explore our curated list of expert AI mentors and their specializations
          </p>
        </div>

        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8 text-center">
          <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-3xl font-bold text-white">2</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Book Session</h3>
          <p class="text-gray-800">
            Choose a time slot that works for you and secure your session instantly
          </p>
        </div>

        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8 text-center">
          <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-3xl font-bold text-white">3</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Meet & Learn</h3>
          <p class="text-gray-800">
            Connect with your mentor for personalized guidance and insights
          </p>
        </div>

        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-8 text-center">
          <div class="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <span class="text-3xl font-bold text-white">4</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Grow Skills</h3>
          <p class="text-gray-800">
            Apply your learnings and continue building your AI expertise
          </p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-gray-900 p-12 text-center">
      <div class="mb-6">
        <span class="text-red-500 font-bold text-sm tracking-wider uppercase">
          Ready to Start?
        </span>
      </div>
      <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Find Your AI Mentor Today
      </h2>
      <p class="text-xl text-gray-800 mb-8 max-w-2xl mx-auto">
        Join thousands of learners accelerating their AI careers with expert guidance
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onclick={handleFindMentors}
          class="px-8 py-4 text-lg font-bold text-white bg-gray-900 rounded-full hover:bg-red-600 transition-colors duration-200 uppercase tracking-wide border-2 border-gray-900 hover:border-red-600"
        >
          Browse Mentors
        </button>
        <button
          onclick={handleGetStarted}
          class="px-8 py-4 text-lg font-bold text-gray-900 bg-white/60 rounded-full hover:bg-gray-900 hover:text-white transition-colors duration-200 uppercase tracking-wide border-2 border-gray-900"
        >
          Sign Up Free
        </button>
      </div>
    </div>
  </div>
</div>
