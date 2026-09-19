import { FieldPage } from "@/components/global/field-page";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { SearchX } from "lucide-react";
import { redirect } from "next/navigation";
import AddSpeciesDialog from "./add-species-dialog";
import SpeciesCard from "./species-card";

export default async function SpeciesList() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/");

  const sessionId = session.user.id;
  const { data: species } = await supabase.from("species").select("*").order("id", { ascending: false });

  return (
    <FieldPage
      eyebrow="Biodiversity archive"
      title="Species field records."
      description="Open a record for the complete profile. Add observations of your own, then revise or remove the records you authored."
      actions={<AddSpeciesDialog userId={sessionId} />}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#c8dbd0] pb-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#517765]">
            Collection index
          </p>
          <p className="text-xs text-[#60796e]">{species?.length ?? 0} records catalogued</p>
        </div>

        {species && species.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {species.map((record) => (
              <SpeciesCard key={record.id} species={record} sessionId={sessionId} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-72 flex-col items-center justify-center border border-dashed border-[#aac4b5] bg-[#f8fbf9] px-6 text-center">
            <SearchX aria-hidden="true" className="h-7 w-7 text-[#5f806f]" />
            <h2 className="mt-4 font-serif text-2xl text-[#204b3d]">No field records yet</h2>
            <p className="mt-2 text-sm text-[#60796e]">Add the first species to begin this collection.</p>
          </div>
        )}
      </div>
    </FieldPage>
  );
}
