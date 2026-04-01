import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailReceivedEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    created_at: string;
    from: string;
    to: string[];
    bcc: string[];
    cc: string[];
    message_id: string;
    subject: string;
    attachments?: Array<{
      id: string;
      filename: string;
      content_type: string;
      content_disposition: string;
      content_id?: string;
    }>;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const event: EmailReceivedEvent = await req.json();

    if (event.type === "email.received") {
      const { data: emailData } = event;

      const { data: savedEmail, error: saveError } = await supabase
        .from("received_emails")
        .insert({
          email_id: emailData.email_id,
          from_email: emailData.from,
          to_email: emailData.to,
          subject: emailData.subject,
          message_id: emailData.message_id,
          has_attachments: (emailData.attachments?.length ?? 0) > 0,
          attachments: emailData.attachments || [],
          raw_event: event,
        })
        .select()
        .single();

      if (saveError) {
        console.error("Error saving received email:", saveError);
        throw saveError;
      }

      const gmailForwardEmail = Deno.env.get("GMAIL_FORWARD_ADDRESS");

      if (gmailForwardEmail) {
        try {
          const forwardUrl = `${supabaseUrl}/functions/v1/forward-to-gmail`;

          const forwardResponse = await fetch(forwardUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              emailId: savedEmail.id,
              to: gmailForwardEmail,
              from: emailData.from,
              subject: emailData.subject,
              originalTo: emailData.to,
            }),
          });

          if (forwardResponse.ok) {
            await supabase
              .from("received_emails")
              .update({
                forwarded_at: new Date().toISOString(),
                forwarded_success: true,
              })
              .eq("id", savedEmail.id);
          }
        } catch (forwardError) {
          console.error("Error forwarding email:", forwardError);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email received and saved",
          email_id: emailData.email_id,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Event received" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
