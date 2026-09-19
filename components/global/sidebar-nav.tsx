"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex gap-1 overflow-x-auto lg:flex-col", className)} {...props}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "whitespace-nowrap border-l-2 px-3 py-2.5 text-left text-sm font-medium transition",
            pathname === item.href
              ? "border-[#bf7138] bg-[#f8fbf9] text-[#204b3d]"
              : "border-transparent text-[#60796e] hover:bg-[#e9f2ed] hover:text-[#204b3d]",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
