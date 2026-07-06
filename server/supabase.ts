import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the SERVICE ROLE key (bypasses RLS).
 * This module must only ever be imported from server code — never from src/.
 */
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env and fill them (local values come from `npx supabase status`)."
    );
  }

  client = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return client;
}

/** Cheap connectivity probe used by /api/health. */
export async function checkSupabase(): Promise<"connected" | "error"> {
  try {
    const { error } = await getSupabase()
      .from("payments")
      .select("id", { count: "exact", head: true });
    return error ? "error" : "connected";
  } catch {
    return "error";
  }
}
