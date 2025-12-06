-- Fix NOT NULL constraints in applications table
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- FIX APPLICATIONS TABLE CONSTRAINTS
-- ============================================

-- First, check if the table exists and what columns it has
DO $$
BEGIN
  -- Drop the existing applications table if it exists
  DROP TABLE IF EXISTS applications CASCADE;
  
  -- Recreate the applications table without NOT NULL constraints
  CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES job(id) ON DELETE CASCADE,
    applicant_name TEXT,
    applicant_email TEXT,
    message TEXT,
    name TEXT,  -- Adding this in case it was expected
    email TEXT, -- Adding this in case it was expected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Add indexes for better performance
  CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
  CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
  
  -- Enable Row Level Security
  ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
  
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can submit applications" ON applications;
  DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON applications;
  DROP POLICY IF EXISTS "Anyone can view applications" ON applications;
  DROP POLICY IF EXISTS "Users can insert applications" ON applications;
  
  -- Create RLS policies - make it completely open for testing
  CREATE POLICY "Anyone can submit applications" 
    ON applications FOR INSERT 
    WITH CHECK (true);
  
  CREATE POLICY "Anyone can view applications" 
    ON applications FOR SELECT 
    USING (true);
  
  CREATE POLICY "Recruiters can view applications for their jobs" 
    ON applications FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM job 
        WHERE job.id = applications.job_id 
        AND job.recruiter_id = auth.uid()
      )
    );

  RAISE NOTICE 'Applications table recreated successfully without NOT NULL constraints';
END $$;

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'applications'
ORDER BY ordinal_position;
