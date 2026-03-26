import { createClient } from "./supabase/server";

export type PlatformSettings = {
  commission_rate: number;
  manual_payments_enabled: boolean;
};

// Reusable Fallback
export const DEFAULT_SETTINGS: PlatformSettings = {
  commission_rate: 0.10,
  manual_payments_enabled: true
};

/**
 * Fetches the global platform runtime configuration perfectly synchronously from Supabase,
 * falling back effortlessly to static defaults if the network fails or DB is out of sync.
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('platform_settings')
      .select('commission_rate, manual_payments_enabled')
      .eq('id', 1)
      .single();

    if (error || !data) {
      console.warn("Failed to fetch dynamic platform settings, defaulting to codebase configuration:", error?.message);
      return DEFAULT_SETTINGS;
    }

    return {
      commission_rate: Number(data.commission_rate),
      manual_payments_enabled: data.manual_payments_enabled
    };
  } catch (error) {
    console.error("Critical fault resolving platform settings:", error);
    return DEFAULT_SETTINGS;
  }
}
