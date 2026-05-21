/*
  # Add prospect confirmation and acknowledgement fields

  Extends prospect_requests so the public request can:
  - store confirmation that the prospect wants to speak with an expert first
  - track acknowledgement email delivery
  - shorten the initial due window to 30 minutes before the audit form is sent
*/

ALTER TABLE public.prospect_requests
  ADD COLUMN IF NOT EXISTS wants_expert_call boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS acknowledgement_sent_at timestamptz;

ALTER TABLE public.prospect_requests
  ALTER COLUMN follow_up_due_at SET DEFAULT (now() + interval '30 minutes');

UPDATE public.prospect_requests
SET wants_expert_call = COALESCE(wants_expert_call, true)
WHERE wants_expert_call IS DISTINCT FROM true;
