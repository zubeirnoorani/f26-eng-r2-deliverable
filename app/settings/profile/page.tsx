import { Separator } from "@/components/ui/separator";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import ProfileForm from "./profile-form";

function SettingsError({ message }: { message: string }) {
  return (
    <div className="border-l-2 border-[#b55343] bg-[#fff0ec] p-5">
      <h3 className="font-serif text-2xl font-normal text-[#7d3028]">Profile unavailable</h3>
      <p className="mt-2 text-sm text-[#815d56]">{message}</p>
    </div>
  );
}

export default async function Settings() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/");
  }

  const { data, error } = await supabase.from("profiles").select().eq("id", session.user.id);

  if (error) {
    return <SettingsError message={error.message} />;
  }

  if (data.length !== 1) {
    return <SettingsError message="There are duplicate UUIDs. Please contact system administrator" />;
  }

  const profileData = data[0];

  // Note: We normally wouldn't need to check this case, but because ts noUncheckedIndexedAccess is enabled in tsconfig, we have to.
  // noUncheckedIndexedAccess provides better typesafety at cost of jumping through occasional hoops.
  // Read more here: https://www.totaltypescript.com/tips/make-accessing-objects-safer-by-enabling-nouncheckedindexedaccess-in-tsconfig
  // https://github.com/microsoft/TypeScript/pull/39560
  if (!profileData) {
    return <SettingsError message="Profile data not found." />;
  }

  return (
    <div>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#517765]">Profile</p>
      <h2 className="mt-2 font-serif text-3xl font-normal text-[#204b3d]">Your public field card</h2>
      <p className="mt-2 text-sm leading-6 text-[#60796e]">This is how other contributors see you in the archive.</p>
      <Separator className="my-7 bg-[#d5e3da]" />
      <ProfileForm profile={profileData} />
    </div>
  );
}
