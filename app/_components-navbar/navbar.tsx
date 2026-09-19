import { createServerSupabaseClient } from "@/lib/server-utils";
import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";
import Link from "next/link";

export default async function Navbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <nav className={cn("flex min-w-0 items-center gap-4 sm:gap-7", className)} {...props}>
      <Link href="/" className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcebe2] text-[#17483b]">
          <Leaf aria-hidden="true" className="h-4 w-4" />
        </span>
        <span className="hidden sm:inline">Biodiversity Hub</span>
      </Link>
      {user && <span aria-hidden="true" className="hidden h-5 w-px bg-[#53766c] sm:block" />}
      {user && (
        <div className="flex min-w-0 items-center gap-4 overflow-x-auto sm:gap-6">
          <Link
            href="/species"
            className="whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c5dbcf] transition hover:text-white"
          >
            Species
          </Link>
          <Link
            href="/species-speed"
            className="whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c5dbcf] transition hover:text-white"
          >
            Speed lab
          </Link>
          <Link
            href="/species-chatbot"
            className="whitespace-nowrap font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#c5dbcf] transition hover:text-white"
          >
            Ask the guide
          </Link>
        </div>
      )}
    </nav>
  );
}
