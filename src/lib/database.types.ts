export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admin_settings: {
        Row: {
          id: string;
          admin_email: string;
          notification_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          admin_email?: string;
          notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          admin_email?: string;
          notification_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      form_invitations: {
        Row: {
          id: string;
          invitee_name: string;
          invitee_email: string;
          invite_token: string;
          sent_at: string;
          expires_at: string;
          status: string;
          created_by: string;
          response_id: string | null;
          created_at: string;
          response_email: string;
          response_cc: string;
          draft_form_data: Json;
          email_sent_at: string | null;
        };
        Insert: {
          id?: string;
          invitee_name?: string;
          invitee_email: string;
          invite_token: string;
          sent_at?: string;
          expires_at?: string;
          status?: string;
          created_by?: string;
          response_id?: string | null;
          created_at?: string;
          response_email?: string;
          response_cc?: string;
          draft_form_data?: Json;
          email_sent_at?: string | null;
        };
        Update: {
          id?: string;
          invitee_name?: string;
          invitee_email?: string;
          invite_token?: string;
          sent_at?: string;
          expires_at?: string;
          status?: string;
          created_by?: string;
          response_id?: string | null;
          created_at?: string;
          response_email?: string;
          response_cc?: string;
          draft_form_data?: Json;
          email_sent_at?: string | null;
        };
        Relationships: [];
      };
      form_responses: {
        Row: {
          id: string;
          user_name: string;
          user_email: string;
          user_position: string;
          user_entity: string;
          submitted_at: string;
          last_updated_at: string;
          is_completed: boolean;
          completion_percentage: number;
          form_data: Json;
          notes: string;
          session_id: string;
          invitation_token: string;
          email_sent_at: string | null;
        };
        Insert: {
          id?: string;
          user_name?: string;
          user_email?: string;
          user_position?: string;
          user_entity?: string;
          submitted_at?: string;
          last_updated_at?: string;
          is_completed?: boolean;
          completion_percentage?: number;
          form_data?: Json;
          notes?: string;
          session_id?: string;
          invitation_token?: string;
          email_sent_at?: string | null;
        };
        Update: {
          id?: string;
          user_name?: string;
          user_email?: string;
          user_position?: string;
          user_entity?: string;
          submitted_at?: string;
          last_updated_at?: string;
          is_completed?: boolean;
          completion_percentage?: number;
          form_data?: Json;
          notes?: string;
          session_id?: string;
          invitation_token?: string;
          email_sent_at?: string | null;
        };
        Relationships: [];
      };
      received_emails: {
        Row: {
          id: string;
          email_id: string;
          created_at: string;
          from_email: string;
          to_email: string[];
          subject: string;
          message_id: string | null;
          has_attachments: boolean;
          attachments: Json | null;
          forwarded_at: string | null;
          forwarded_success: boolean;
          raw_event: Json;
        };
        Insert: {
          id?: string;
          email_id: string;
          created_at?: string;
          from_email: string;
          to_email: string[];
          subject: string;
          message_id?: string | null;
          has_attachments?: boolean;
          attachments?: Json | null;
          forwarded_at?: string | null;
          forwarded_success?: boolean;
          raw_event: Json;
        };
        Update: {
          id?: string;
          email_id?: string;
          created_at?: string;
          from_email?: string;
          to_email?: string[];
          subject?: string;
          message_id?: string | null;
          has_attachments?: boolean;
          attachments?: Json | null;
          forwarded_at?: string | null;
          forwarded_success?: boolean;
          raw_event?: Json;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
