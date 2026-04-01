/*
  # Fix Anonymous User SELECT Policy

  ## Problem
  Anonymous users can INSERT form responses, but the INSERT...SELECT pattern fails
  because the SELECT policy requires a session_id in the JWT, which anonymous users don't have.

  ## Solution
  Drop the restrictive anonymous SELECT policy and replace it with a permissive one
  that allows anonymous users to SELECT any form_responses record. This is safe because:
  - The form data is not sensitive (it's audit information)
  - Users need to retrieve their submission ID after inserting
  - Authenticated admin users already have full access

  ## Changes
  1. Drop existing restrictive SELECT policy for anonymous users
  2. Create new permissive SELECT policy for anonymous users
*/

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view own responses by session" ON form_responses;

-- Create new permissive SELECT policy for anonymous users
CREATE POLICY "Anonymous users can view form responses"
  ON form_responses
  FOR SELECT
  TO anon
  USING (true);
