import { FieldPage } from "@/components/global/field-page";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import AddSpeciesDialog from "./add-species-dialog";
import SpeciesCollection from "./species-collection";

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
      <SpeciesCollection species={species ?? []} sessionId={sessionId} />
    </FieldPage>
  );
}
