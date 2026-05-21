export type ProspectStatus = 'new' | 'contact_scheduled' | 'audit_pending' | 'audit_sent' | 'closed';

export interface ProspectFormValues {
  fullName: string;
  profession: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  activitySector: string;
  needDescription: string;
  wantsExpertCall: boolean;
}

export interface ProspectRecord {
  id: string;
  prospect_code: string;
  full_name: string;
  profession: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  activity_sector: string;
  need_description: string;
  wants_expert_call: boolean;
  status: ProspectStatus;
  source: string;
  created_at: string;
  updated_at: string;
  follow_up_due_at: string;
  acknowledgement_sent_at: string | null;
  audit_form_sent_at: string | null;
  last_contacted_at: string | null;
  notes: string;
}

export interface ProspectSubmissionResult {
  prospect: ProspectRecord;
  storageMode: 'supabase' | 'local';
  notificationError?: string;
}
