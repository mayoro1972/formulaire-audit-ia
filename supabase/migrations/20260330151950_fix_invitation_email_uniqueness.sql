-- Fix invitation email uniqueness to allow re-invitations
-- Remove the unique constraint on email to allow multiple invitations to the same person

-- Drop the unique constraint on invitee_email if it exists
DO $$
BEGIN
  -- Check if unique constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'form_invitations_invitee_email_key'
  ) THEN
    ALTER TABLE form_invitations DROP CONSTRAINT form_invitations_invitee_email_key;
  END IF;
END $$;

-- Keep the unique constraint on invite_token (each token must be unique)
-- Add index on invitee_email for performance
CREATE INDEX IF NOT EXISTS idx_form_invitations_email ON form_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_form_invitations_status ON form_invitations(status);
