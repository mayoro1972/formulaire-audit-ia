/*
  # Create prospect request funnel

  This migration adds a dedicated pipeline table for visitors who request an expert-led audit.
  Public visitors do not access the table directly; inserts are performed via an Edge Function.
  Admin users can review, update and export leads from the dashboard.
*/

CREATE TABLE IF NOT EXISTS public.prospect_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_code text NOT NULL UNIQUE,
  full_name text NOT NULL DEFAULT '',
  profession text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  activity_sector text NOT NULL DEFAULT '',
  need_description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  source text NOT NULL DEFAULT 'site_public',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  follow_up_due_at timestamptz NOT NULL DEFAULT (now() + interval '48 hours'),
  audit_form_sent_at timestamptz,
  last_contacted_at timestamptz,
  notes text NOT NULL DEFAULT '',
  CONSTRAINT valid_prospect_status CHECK (status IN ('new', 'contact_scheduled', 'audit_pending', 'audit_sent', 'closed'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_prospect_requests_email_unique
  ON public.prospect_requests(email);

CREATE INDEX IF NOT EXISTS idx_prospect_requests_created_at
  ON public.prospect_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_prospect_requests_follow_up_due_at
  ON public.prospect_requests(follow_up_due_at ASC);

ALTER TABLE public.prospect_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view prospect requests"
  ON public.prospect_requests
  FOR SELECT
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "Admin users can update prospect requests"
  ON public.prospect_requests
  FOR UPDATE
  TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admin users can delete prospect requests"
  ON public.prospect_requests
  FOR DELETE
  TO authenticated
  USING (public.current_user_is_admin());

CREATE OR REPLACE FUNCTION public.update_prospect_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_prospect_requests_updated_at ON public.prospect_requests;
CREATE TRIGGER set_prospect_requests_updated_at
  BEFORE UPDATE ON public.prospect_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_prospect_requests_updated_at();
