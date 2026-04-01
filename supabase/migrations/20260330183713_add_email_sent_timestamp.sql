/*
  # Add Email Sent Timestamp

  ## Overview
  Add a column to track when the form response was sent via email.

  ## Changes
  1. New Column
    - `email_sent_at` (timestamptz, nullable) - Timestamp when the form was sent via email
    
  ## Notes
  - This field remains NULL until the form is actually sent via email
  - Helps track which forms have been emailed and when
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_responses' AND column_name = 'email_sent_at'
  ) THEN
    ALTER TABLE form_responses ADD COLUMN email_sent_at timestamptz;
  END IF;
END $$;
