import { FieldPage } from "@/components/global/field-page";
import { SidebarNav } from "@/components/global/sidebar-nav";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";

const sidebarNavItems = [
  { title: "General", href: "/settings/general" },
  { title: "Profile", href: "/settings/profile" },
];

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/");

  return (
    <FieldPage
      eyebrow="Station controls"
      title="Your field profile."
      description="Manage how your name and notes appear throughout the biodiversity archive."
    >
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="border border-[#c8dbd0] bg-[#dfece5] p-3 lg:self-start">
          <p className="px-3 pb-3 pt-2 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#60796e]">
            Settings index
          </p>
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <section className="min-w-0 border border-[#c8dbd0] bg-[#f8fbf9] p-6 sm:p-8 lg:p-10">{children}</section>
      </div>
    </FieldPage>
  );
}
