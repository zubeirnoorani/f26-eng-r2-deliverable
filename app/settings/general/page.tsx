import { CheckCircle2, Moon, ShieldCheck } from "lucide-react";

const preferences = [
  {
    icon: Moon,
    title: "Display mode",
    description: "Use the sun and moon control in the station bar to switch between light, dark, and system themes.",
  },
  {
    icon: ShieldCheck,
    title: "Account access",
    description: "Your account uses secure email links, so there is no password to store or manage here.",
  },
] as const;

export default function GeneralSettings() {
  return (
    <div>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#517765]">General</p>
      <h2 className="mt-2 font-serif text-3xl font-normal text-[#204b3d]">Station preferences</h2>
      <p className="mt-2 text-sm leading-6 text-[#60796e]">A quick reference for your current account controls.</p>

      <div className="mt-8 divide-y divide-[#d5e3da] border-y border-[#d5e3da]">
        {preferences.map(({ icon: Icon, title, description }) => (
          <article key={title} className="grid gap-4 py-6 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e2eee7] text-[#39715a]">
              <Icon aria-hidden="true" className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#254d40]">{title}</h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-[#60796e]">{description}</p>
            </div>
            <span className="flex items-center gap-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#4e7b66]">
              <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
              Active
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
