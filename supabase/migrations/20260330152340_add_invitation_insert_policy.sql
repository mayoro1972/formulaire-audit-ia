/*
  # Add INSERT policy for form_invitations
  
  1. Changes
    - Add INSERT policy to allow anyone to create invitations
    - This enables the invitation sending functionality
  
  2. Security
    - Allows public insert access for invitation creation
    - Each invitation gets a unique token for security
*/

-- Add INSERT policy for creating invitations
CREATE POLICY "Anyone can create invitations"
  ON form_invitations
  FOR INSERT
  TO public
  WITH CHECK (true);
