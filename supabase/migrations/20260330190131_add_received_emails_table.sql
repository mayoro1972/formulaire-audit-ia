/*
  # Create received emails table

  1. New Tables
    - `received_emails`
      - `id` (uuid, primary key) - Unique identifier
      - `email_id` (text) - Resend email ID
      - `created_at` (timestamptz) - When email was received
      - `from_email` (text) - Sender email address
      - `to_email` (text[]) - Recipient email addresses
      - `subject` (text) - Email subject
      - `message_id` (text) - Email message ID
      - `has_attachments` (boolean) - Whether email has attachments
      - `attachments` (jsonb) - Attachment metadata
      - `forwarded_at` (timestamptz, nullable) - When email was forwarded to Gmail
      - `forwarded_success` (boolean, default false) - Whether forwarding succeeded
      - `raw_event` (jsonb) - Full webhook event data

  2. Security
    - Enable RLS on `received_emails` table
    - Add policy for service role to insert received emails
    - Add policy for authenticated users to read received emails
*/

CREATE TABLE IF NOT EXISTS received_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  from_email text NOT NULL,
  to_email text[] NOT NULL,
  subject text NOT NULL,
  message_id text,
  has_attachments boolean DEFAULT false,
  attachments jsonb,
  forwarded_at timestamptz,
  forwarded_success boolean DEFAULT false,
  raw_event jsonb NOT NULL
);

ALTER TABLE received_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert received emails"
  ON received_emails
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update received emails"
  ON received_emails
  FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view received emails"
  ON received_emails
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_received_emails_created_at ON received_emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_received_emails_email_id ON received_emails(email_id);