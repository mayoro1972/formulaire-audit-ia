/*
  # Create Form Responses Table

  ## Overview
  This migration creates a comprehensive table to store IA audit form responses submitted by users.
  Each response is uniquely identified and includes all form data, user information, and metadata.

  ## New Tables
  
  ### `form_responses`
  Main table storing all form submission data.
  
  #### User Information Columns
  - `id` (uuid, primary key) - Unique identifier for each response
  - `user_name` (text) - Name of the person completing the form
  - `user_email` (text) - Email address of the respondent
  - `user_position` (text) - Job position/title
  - `user_entity` (text) - Business unit/entity
  
  #### Metadata Columns
  - `submitted_at` (timestamptz) - Timestamp when form was submitted
  - `last_updated_at` (timestamptz) - Last modification timestamp
  - `is_completed` (boolean) - Whether the form has been fully completed
  - `completion_percentage` (integer) - Estimated completion percentage (0-100)
  
  #### Form Data Column
  - `form_data` (jsonb) - Complete form data stored as JSON for flexibility
  
  #### Additional Fields
  - `notes` (text) - Optional notes or comments
  - `session_id` (text) - Optional session identifier for tracking
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the `form_responses` table
  - Public insert policy allows anyone to submit forms (for public form access)
  - Authenticated users can view all responses (for admin dashboard)
  - Authenticated users can update all responses (for admin management)
  
  ## Indexes
  - Index on `user_email` for faster lookups by email
  - Index on `submitted_at` for chronological queries
  - Index on `is_completed` for filtering complete vs incomplete responses
  
  ## Notes
  1. The `form_data` JSONB column provides flexibility for the complex form structure
  2. Using JSONB allows for efficient querying of specific form fields when needed
  3. Timestamps use `timestamptz` for timezone awareness
  4. Public insert access enables form submission without authentication
  5. Admin dashboard requires authentication to view/manage responses
*/

-- Create form_responses table
CREATE TABLE IF NOT EXISTS form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User information
  user_name text DEFAULT '',
  user_email text DEFAULT '',
  user_position text DEFAULT '',
  user_entity text DEFAULT '',
  
  -- Metadata
  submitted_at timestamptz DEFAULT now(),
  last_updated_at timestamptz DEFAULT now(),
  is_completed boolean DEFAULT false,
  completion_percentage integer DEFAULT 0,
  
  -- Form data (stored as JSONB for flexibility)
  form_data jsonb DEFAULT '{}'::jsonb,
  
  -- Additional fields
  notes text DEFAULT '',
  session_id text DEFAULT ''
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_form_responses_email ON form_responses(user_email);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted ON form_responses(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_responses_completed ON form_responses(is_completed);

-- Enable Row Level Security
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (submit) form responses
CREATE POLICY "Anyone can submit form responses"
  ON form_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can view all responses (for admin dashboard)
CREATE POLICY "Authenticated users can view all responses"
  ON form_responses
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can update responses (for admin management)
CREATE POLICY "Authenticated users can update responses"
  ON form_responses
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Public users can view their own responses by session_id
CREATE POLICY "Users can view own responses by session"
  ON form_responses
  FOR SELECT
  TO anon
  USING (session_id = current_setting('request.jwt.claims', true)::json->>'session_id' OR session_id = '');

-- Function to update last_updated_at timestamp
CREATE OR REPLACE FUNCTION update_form_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update last_updated_at
DROP TRIGGER IF EXISTS set_form_responses_updated_at ON form_responses;
CREATE TRIGGER set_form_responses_updated_at
  BEFORE UPDATE ON form_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_form_responses_updated_at();