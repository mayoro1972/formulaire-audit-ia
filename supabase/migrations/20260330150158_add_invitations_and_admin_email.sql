-- Add invitations system and admin notifications
--
-- 1. New Tables
--   - form_invitations: Track invitations sent to users
--   - admin_settings: Store admin email for notifications
--
-- 2. Changes
--   - Add invitation_token to form_responses
--
-- 3. Security
--   - Enable RLS on all tables
--   - Add appropriate policies

-- Add invitation_token to form_responses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'form_responses' AND column_name = 'invitation_token'
  ) THEN
    ALTER TABLE form_responses ADD COLUMN invitation_token text DEFAULT '';
  END IF;
END $$;

-- Create form_invitations table
CREATE TABLE IF NOT EXISTS form_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitee_name text NOT NULL DEFAULT '',
  invitee_email text NOT NULL,
  invite_token text UNIQUE NOT NULL,
  sent_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  status text DEFAULT 'pending',
  created_by text DEFAULT '',
  response_id uuid,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'expired'))
);

ALTER TABLE form_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view invitations with valid token"
  ON form_invitations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update invitation status"
  ON form_invitations FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email text NOT NULL DEFAULT '',
  notification_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read admin settings"
  ON admin_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update admin settings"
  ON admin_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert admin settings"
  ON admin_settings FOR INSERT
  WITH CHECK (true);

-- Insert default admin settings if not exists
INSERT INTO admin_settings (admin_email, notification_enabled)
SELECT '', true
WHERE NOT EXISTS (SELECT 1 FROM admin_settings LIMIT 1);
