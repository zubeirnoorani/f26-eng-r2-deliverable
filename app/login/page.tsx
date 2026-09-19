import { FieldPage } from "@/components/global/field-page";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { CheckCircle2, Mail } from "lucide-react";
import { redirect } from "next/navigation";
import UserAuthForm from "./user-auth-form";

export default async function LoginPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect("/species");

  return (
    <FieldPage
      eyebrow="Field station access"
      title="Return to the archive."
      description="Use a secure email link to sign in or create your field station account."
      contentClassName="flex items-center"
    >
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden border border-[#c8dbd0] bg-[#f8fbf9] shadow-[0_20px_55px_-40px_rgba(14,60,50,0.55)] md:grid-cols-[0.85fr_1.15fr]">
        <aside className="bg-[#dfece5] p-7 sm:p-9">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#517765]">
            One link. No password.
          </p>
          <h2 className="mt-4 font-serif text-3xl font-normal leading-tight text-[#204b3d]">
            Your records stay connected to you.
          </h2>
          <ul className="mt-8 space-y-4 text-sm leading-6 text-[#527064]">
            {[
              "Open the complete species archive",
              "Create and manage your own records",
              "Use the species guide and research tools",
            ].map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <CheckCircle2 aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-[#3f7a5e]" />
                {benefit}
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex flex-col justify-center p-7 sm:p-10 md:p-12">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e2eee7] text-[#2f7257]">
            <Mail aria-hidden="true" className="h-5 w-5" />
          </span>
          <h2 className="mt-6 font-serif text-3xl font-normal text-[#173d35]">Sign in by email</h2>
          <p className="mt-2 text-sm leading-6 text-[#60796e]">
            We’ll send you a magic link. Open it in this browser to continue.
          </p>
          <UserAuthForm className="mt-7" />
        </section>
      </div>
    </FieldPage>
  );
}
