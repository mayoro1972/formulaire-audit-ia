export interface Database {
  public: {
    Tables: {
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
          form_data: Record<string, unknown>;
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
          form_data?: Record<string, unknown>;
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
          form_data?: Record<string, unknown>;
          notes?: string;
          session_id?: string;
          invitation_token?: string;
          email_sent_at?: string | null;
        };
      };
    };
  };
}
