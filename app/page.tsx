import { FieldPage } from "@/components/global/field-page";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { ArrowUpRight, Bot, Gauge, LibraryBig } from "lucide-react";
import Link from "next/link";

const stations = [
  {
    href: "/species",
    icon: LibraryBig,
    label: "Species archive",
    description: "Browse field records, open detailed profiles, and contribute species of your own.",
    requiresAccount: true,
  },
  {
    href: "/species-chatbot",
    icon: Bot,
    label: "Ask the guide",
    description: "Explore habitats, diets, behavior, adaptations, and conservation with a focused AI guide.",
    requiresAccount: false,
  },
  {
    href: "/species-speed",
    icon: Gauge,
    label: "Speed lab",
    description: "Study how movement and survival strategies vary across the animal kingdom.",
    requiresAccount: true,
  },
] as const;

export default async function Home() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const archiveHref = user ? "/species" : "/login";

  return (
    <FieldPage
      eyebrow="Biodiversity field station"
      title="Every species has a story worth recording."
      description="Explore a living collection of wildlife records, ask better questions about the natural world, and add observations to the archive."
      actions={
        <Link
          href={archiveHref}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#bf7138] px-5 text-sm font-semibold text-white transition hover:bg-[#a95e2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2c39f] focus-visible:ring-offset-2 focus-visible:ring-offset-[#123d36]"
        >
          Enter the archive
          <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      }
    >
      <section className="mx-auto grid max-w-7xl gap-px overflow-hidden border border-[#c8dbd0] bg-[#c8dbd0] lg:grid-cols-3">
        {stations.map(({ href, icon: Icon, label, description, requiresAccount }, index) => (
          <Link
            key={href}
            href={!user && requiresAccount ? "/login" : href}
            className="group flex min-h-64 flex-col bg-[#f8fbf9] p-6 transition hover:bg-white sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dfece5] text-[#2f7257] transition group-hover:bg-[#cfe3d7]">
                <Icon aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#769083]">
                0{index + 1}
              </span>
            </div>
            <h2 className="mt-10 font-serif text-3xl font-normal text-[#173d35]">{label}</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[#60796e]">{description}</p>
            <span className="mt-auto flex items-center gap-2 pt-8 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#39715a]">
              Open station
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl border-y border-[#c8dbd0] py-6 sm:grid-cols-[1fr_2fr] sm:gap-10 sm:py-8">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#517765]">Our field rule</p>
        <p className="mt-3 max-w-3xl font-serif text-2xl leading-snug text-[#254d40] sm:mt-0 sm:text-3xl">
          Curiosity starts the record. Careful observation makes it useful.
        </p>
      </section>
    </FieldPage>
  );
}
