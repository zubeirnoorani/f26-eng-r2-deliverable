import { ModeToggle } from "@/app/_components-navbar/mode-toggle";
import { Toaster } from "@/components/ui/toaster";
import AuthStatus from "./_components-navbar/auth-status";
import Navbar from "./_components-navbar/navbar";
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "T4SG Biodiversity Hub",
  description: "T4SG Deliverable for Fall 2026 Applications.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Hydration warning suppressed because of next-themes https://github.com/pacocoursey/next-themes */}
      <body className="min-h-dvh bg-[#eef5f1] text-[#173d35]">
        <Providers>
          <div className="min-h-dvh">
            <header className="sticky top-0 z-40 border-b border-[#315c51] bg-[#0d302b] text-[#ecf6ee] shadow-sm">
              <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                <Navbar className="min-w-0 flex-1" />
                <div className="ml-auto flex shrink-0 items-center gap-2">
                  <ModeToggle />
                  <AuthStatus />
                </div>
              </div>
            </header>
            <div>{children}</div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
