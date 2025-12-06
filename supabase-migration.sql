-- Job Board Feature - Complete Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE JOB TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS job (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  salary TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  contact TEXT NOT NULL,
  recruiter_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_recruiter_id ON job(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_job_created_at ON job(created_at DESC);

-- Enable Row Level Security
ALTER TABLE job ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON job;
DROP POLICY IF EXISTS "Users can insert their own jobs" ON job;
DROP POLICY IF EXISTS "Users can update their own jobs" ON job;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON job;

-- Create RLS policies
CREATE POLICY "Jobs are viewable by everyone" 
  ON job FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own jobs" 
  ON job FOR INSERT 
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Users can update their own jobs" 
  ON job FOR UPDATE 
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Users can delete their own jobs" 
  ON job FOR DELETE 
  USING (auth.uid() = recruiter_id);

-- ============================================
-- 2. CREATE APPLICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES job(id) ON DELETE CASCADE,
  applicant_name TEXT,
  applicant_email TEXT,
  message TEXT,
  name TEXT,  -- Alternative field name for applicant name
  email TEXT, -- Alternative field name for applicant email
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can submit applications" ON applications;
DROP POLICY IF EXISTS "Recruiters can view applications for their jobs" ON applications;
DROP POLICY IF EXISTS "Anyone can view applications" ON applications;
DROP POLICY IF EXISTS "Users can insert applications" ON applications;

-- Create RLS policies - completely open for testing
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

-- ============================================
-- 3. CREATE SAMPLE DATA (Optional)
-- ============================================

-- Uncomment the following to insert sample job postings
-- Note: Replace 'YOUR_USER_ID' with actual user IDs from Supabase Auth

/*
INSERT INTO job (title, company, location, type, salary, description, requirements, contact, recruiter_id) VALUES
(
  'Product Manager',
  'Horizon Labs',
  'Mumbai',
  'Full-time',
  '12 - 14 lakhs',
  'Define product strategy and work with cross-functional teams to deliver features. Analyze metrics and prioritize the roadmap.',
  E'4+ years of product management experience\nStrong communication and analytical skills\nFamiliarity with Agile methodologies',
  'contact@horizonlabs.com',
  'YOUR_USER_ID'
),
(
  'Senior Frontend Developer',
  'TechCorp',
  'Bangalore',
  'Full-time',
  '15 - 18 lakhs',
  'Lead the development of modern web applications using React and TypeScript. Collaborate with designers and backend engineers.',
  E'5+ years of frontend development experience\nExpert in React, TypeScript, and modern CSS\nExperience with Next.js and state management',
  'hr@techcorp.com',
  'YOUR_USER_ID'
),
(
  'Data Scientist',
  'Analytics Pro',
  'Hyderabad',
  'Full-time',
  '18 - 22 lakhs',
  'Build machine learning models and data pipelines. Work with large datasets to extract insights and drive business decisions.',
  E'3+ years of data science experience\nProficient in Python, SQL, and ML frameworks\nExperience with cloud platforms (AWS/Azure)',
  'jobs@analyticspro.com',
  'YOUR_USER_ID'
);
*/

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify tables were created
SELECT 'Setup completed successfully!' AS status;
SELECT 'Total job tables: ' || COUNT(*) FROM information_schema.tables 
  WHERE table_name IN ('job', 'applications');
