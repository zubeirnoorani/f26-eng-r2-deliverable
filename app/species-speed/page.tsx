import { FieldPage } from "@/components/global/field-page";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { Activity, Footprints, Gauge } from "lucide-react";
import { redirect } from "next/navigation";
import AnimalSpeedGraph from "./animal-speed-graph";

const observations = [
  { icon: Gauge, label: "Burst speed", copy: "Short pursuits reward acceleration and explosive movement." },
  { icon: Footprints, label: "Endurance", copy: "Long distance survival depends on efficiency as much as top speed." },
  { icon: Activity, label: "Adaptation", copy: "Body shape, habitat, and hunting strategy all influence movement." },
] as const;

export default async function SpeciesSpeedPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/");

  return (
    <FieldPage
      eyebrow="Comparative movement lab"
      title="Built to move differently."
      description="Explore how diet, habitat, and survival strategy shape the speeds animals can reach."
    >
      <div className="mx-auto max-w-7xl">
        <section className="grid gap-px border border-[#c8dbd0] bg-[#c8dbd0] md:grid-cols-3">
          {observations.map(({ icon: Icon, label, copy }) => (
            <div key={label} className="bg-[#f8fbf9] p-6">
              <Icon aria-hidden="true" className="h-5 w-5 text-[#bf7138]" />
              <h2 className="mt-4 font-serif text-2xl font-normal text-[#204b3d]">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-[#60796e]">{copy}</p>
            </div>
          ))}
        </section>

        <section className="mt-7 border border-[#c8dbd0] bg-[#f8fbf9]">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d5e3da] px-6 py-5 sm:px-8">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#517765]">
                Velocity study
              </p>
              <h2 className="mt-2 font-serif text-3xl font-normal text-[#204b3d]">How fast are animals?</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-[#60796e]">
              Compare carnivores, herbivores, and omnivores to see how speed supports different survival strategies.
            </p>
          </div>
          <div className="min-h-[420px] p-5 sm:p-8">
            <AnimalSpeedGraph />
          </div>
        </section>
      </div>
    </FieldPage>
  );
}
