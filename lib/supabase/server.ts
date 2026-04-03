import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** True when real credentials have been added to .env.local */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_URL !== "https://your-project-id.supabase.co" &&
      SUPABASE_ANON_KEY &&
      SUPABASE_ANON_KEY !== "your-anon-key-here"
  );
}

/**
 * Server-side Supabase client.
 * Throws a descriptive error if credentials haven't been configured yet.
 * Guard with `isSupabaseConfigured()` before calling in optional contexts (e.g. Navbar).
 */
export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase credentials are not configured. " +
        "Copy .env.local.example to .env.local and fill in your " +
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll called from a Server Component — session refresh
          // handled by middleware.
        }
      },
    },
  });
}

/**
 * Admin-level Supabase client using Service Role Key.
 * BYPASSES Row Level Security (RLS). 
 * ONLY use for background processes (webhooks, cron jobs, etc.) 
 * where no authenticated user is present.
 */
export async function createAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured. Webhooks will fail.");
  }

  return createServerClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() { return []; },
      setAll() { /* No-op */ },
    },
  });
}

/**
 * Static Supabase client for build-time operations (e.g. generateStaticParams).
 * Does NOT use cookies to avoid errors during static site generation.
 */
export async function createStaticClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase credentials are not configured.");
  }

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return []; },
      setAll() { /* No-op in static context */ },
    },
  });
}
