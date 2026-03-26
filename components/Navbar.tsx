import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import NavbarClient from "./NavbarClient";
import { getDictionary, getLocale } from "@/lib/i18n";

export default async function Navbar() {
  let user: { id: string; email: string; name: string | null } | null = null;
  let notifications = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        user = {
          id: data.user.id,
          email: data.user.email!,
          name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            null,
        };

        const { data: notifsRes } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        notifications = notifsRes || [];
      }
    } catch {
      // Silently fail
    }
  }

  const dict = await getDictionary();
  const locale = await getLocale();

  return <NavbarClient user={user} dict={dict.nav} locale={locale} initialNotifications={notifications} />;
}
