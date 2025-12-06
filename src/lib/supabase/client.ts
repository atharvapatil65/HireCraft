import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

export type Job = {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  requirements: string
  contact: string
  created_at: string
  recruiter_id: string
}

export type Application = {
  id: string
  job_id: string
  applicant_name?: string
  applicant_email?: string
  message?: string
  name?: string  // Alternative field name
  email?: string // Alternative field name
  created_at: string
}
