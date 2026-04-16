/*
  # Harden admin access and anonymous respondent flows

  This migration introduces two helper functions:
  - current_user_is_admin(): true when the authenticated email matches admin_settings.admin_email
  - admin_bootstrap_open(): true while no admin email has been configured yet

  It then removes the broad public policies that exposed admin and invitation data,
  while keeping public insert access on form_responses for the respondent journey.
*/

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_settings
    WHERE NULLIF(BTRIM(admin_email), '') IS NOT NULL
      AND LOWER(admin_email) = LOWER(COALESCE(auth.jwt() ->> 'email', ''))
  );
$$;

CREATE OR REPLACE FUNCTION public.admin_bootstrap_open()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.admin_settings
    WHERE NULLIF(BTRIM(admin_email), '') IS NOT NULL
  );
$$;

GRANT EXECUTE ON FUNCTION public.current_user_is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_bootstrap_open() TO anon, authenticated;

DROP POLICY IF EXISTS "Authenticated users can view all responses" ON form_responses;
DROP POLICY IF EXISTS "Authenticated users can update responses" ON form_responses;
DROP POLICY IF EXISTS "Anonymous users can view form responses" ON form_responses;
DROP POLICY IF EXISTS "Anyone can view invitations with valid token" ON form_invitations;
DROP POLICY IF EXISTS "Anyone can update invitation status" ON form_invitations;
DROP POLICY IF EXISTS "Anyone can create invitations" ON form_invitations;
DROP POLICY IF EXISTS "Anyone can read admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Anyone can update admin settings" ON admin_settings;
DROP POLICY IF EXISTS "Anyone can insert admin settings" ON admin_settings;

CREATE POLICY "Admin users can view responses"
  ON form_responses
  FOR SELECT
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "Admin users can update responses"
  ON form_responses
  FOR UPDATE
  TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admin users can delete responses"
  ON form_responses
  FOR DELETE
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "Admin users can manage invitations"
  ON form_invitations
  FOR SELECT
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "Admin users can create invitations"
  ON form_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admin users can update invitations"
  ON form_invitations
  FOR UPDATE
  TO authenticated
  USING (public.current_user_is_admin())
  WITH CHECK (public.current_user_is_admin());

CREATE POLICY "Admin users can delete invitations"
  ON form_invitations
  FOR DELETE
  TO authenticated
  USING (public.current_user_is_admin());

CREATE POLICY "Admin users can read settings"
  ON admin_settings
  FOR SELECT
  TO authenticated
  USING (public.current_user_is_admin() OR public.admin_bootstrap_open());

CREATE POLICY "Bootstrap or admin users can insert settings"
  ON admin_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_user_is_admin() OR public.admin_bootstrap_open());

CREATE POLICY "Bootstrap or admin users can update settings"
  ON admin_settings
  FOR UPDATE
  TO authenticated
  USING (public.current_user_is_admin() OR public.admin_bootstrap_open())
  WITH CHECK (public.current_user_is_admin() OR public.admin_bootstrap_open());
