import { cn } from "@/lib/utils";
import { Leaf } from "lucide-react";
import type { ReactNode } from "react";

interface FieldPageProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
}

export function FieldPage({ eyebrow, title, description, actions, children, contentClassName }: FieldPageProps) {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col bg-[#eef5f1] text-[#173d35]">
      <header className="relative overflow-hidden bg-[#123d36] px-5 py-9 text-[#ecf6ee] sm:px-8 sm:py-12 lg:px-12">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-[#78a994]/25"
        />
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-14 h-44 w-44 rounded-full border border-[#78a994]/30"
        />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#abd2bc]">
              <Leaf aria-hidden="true" className="h-3.5 w-3.5" />
              {eyebrow}
            </p>
            <h1 className="mt-4 font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#c8ddd0] sm:text-base">{description}</p>
          </div>
          {actions && <div className="relative shrink-0">{actions}</div>}
        </div>
      </header>

      <main className={cn("flex-1 px-5 py-8 sm:px-8 sm:py-10 lg:px-12", contentClassName)}>{children}</main>
    </div>
  );
}
