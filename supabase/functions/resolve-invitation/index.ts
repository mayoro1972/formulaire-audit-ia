import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  inviteToken?: string;
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { inviteToken }: RequestBody = await req.json();
    const normalizedInviteToken = inviteToken?.trim();

    if (!normalizedInviteToken) {
      return jsonResponse({ error: "Missing invite token" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return jsonResponse({ error: "Supabase service role is not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data, error } = await supabase
      .from("form_invitations")
      .select("invitee_name, invitee_email, expires_at, status, draft_form_data")
      .eq("invite_token", normalizedInviteToken)
      .maybeSingle();

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    if (!data) {
      return jsonResponse({ error: "Invitation invalide ou introuvable." }, 404);
    }

    if (data.status === "completed") {
      return jsonResponse({ error: "Cette invitation a deja ete utilisee." }, 409);
    }

    if (new Date(data.expires_at).getTime() < Date.now()) {
      await supabase
        .from("form_invitations")
        .update({ status: "expired" })
        .eq("invite_token", normalizedInviteToken);

      return jsonResponse({ error: "Cette invitation a expire." }, 410);
    }

    return jsonResponse({
      success: true,
      invitation: {
        invitee_name: data.invitee_name,
        invitee_email: data.invitee_email,
        expires_at: data.expires_at,
        draft_form_data:
          data.draft_form_data && typeof data.draft_form_data === "object" && !Array.isArray(data.draft_form_data)
            ? data.draft_form_data
            : {},
      },
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});
