// src/app.d.ts
import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from './lib/types/database.types'

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>
      safeGetSession: () => Promise<{ user: User | null }>
      user: User | null
    }
    interface PageData {
      user: User | null
    }
    // interface Error {}
    // interface Platform {}
  }
}

export {}
