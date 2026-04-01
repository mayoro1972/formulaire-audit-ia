/*
  # Add invitation routing and draft support

  This migration lets each invitation define where the completed form should be
  sent and optionally carry a prefilled draft snapshot for the invitee.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_invitations' AND column_name = 'response_email'
  ) THEN
    ALTER TABLE form_invitations ADD COLUMN response_email text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_invitations' AND column_name = 'response_cc'
  ) THEN
    ALTER TABLE form_invitations ADD COLUMN response_cc text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_invitations' AND column_name = 'draft_form_data'
  ) THEN
    ALTER TABLE form_invitations ADD COLUMN draft_form_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_invitations' AND column_name = 'email_sent_at'
  ) THEN
    ALTER TABLE form_invitations ADD COLUMN email_sent_at timestamptz;
  END IF;
END $$;

UPDATE form_invitations
SET email_sent_at = sent_at
WHERE email_sent_at IS NULL
  AND sent_at IS NOT NULL;

UPDATE form_invitations
SET response_email = admin_source.admin_email
FROM (
  SELECT admin_email
  FROM admin_settings
  ORDER BY created_at ASC
  LIMIT 1
) AS admin_source
WHERE COALESCE(form_invitations.response_email, '') = '';
