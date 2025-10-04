# 🧠 SenpAI — AI Mentorship Marketplace

A platform where **AI mentors** connect with **learners** for 1:1 sessions, cohort coaching, and project guidance. Think: *"Calendly + Stripe + Chat + Profiles"* for AI mentorship.

---

## 🎯 Overview

**Find an AI mentor, book a session, pay securely, and chat — all in one place.**

### Problem → Solution
- **Problem:** People struggle to learn AI without guidance; mentors lack a simple way to monetize expertise.  
- **Solution:** A marketplace with searchable mentor profiles, time slots, secure checkout, messaging, and reviews.

### Core Features
- Mentor profiles with bio, topics, expertise, and hourly rates
- Search & filters by topic, level, price, and availability
- Booking & secure Stripe checkout
- Role-based authentication (mentor/mentee)
- Real-time messaging between mentors and mentees
- File uploads for avatars and portfolios
- Reviews & ratings system

---

## 🛠️ Tech Stack

- **Frontend/App:** SvelteKit 5 (Runes), TypeScript, TailwindCSS  
- **Auth/DB/Realtime:** Supabase (Postgres + RLS)
- **Payments:** Stripe Checkout + Webhooks  
- **Storage:** Supabase Storage
- **Deployment:** Vercel (`@sveltejs/adapter-vercel`)  
- **Emails:** Resend/Postmark

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account

### Installation

```sh
# Install dependencies
npm install

# Set up environment variables in .env
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - STRIPE_SECRET_KEY
# - PUBLIC_BASE_URL

# Start development server
npm run dev
```

### Building for Production

```sh
# Create production build
npm run build

# Preview production build
npm run preview
```

---

## 📊 Project Status

Currently in active development. Core features include authentication, mentor profiles, booking system, Stripe integration, and real-time messaging.

---

**Built with ❤️ using SvelteKit 5**
