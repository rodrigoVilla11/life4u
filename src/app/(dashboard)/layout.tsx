import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ColorThemeLoader } from "@/components/layout/color-theme-loader";
import { auth } from "@/lib/auth";
import { getUserModules, getUserColorTheme } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import type { ModuleConfig } from "@/lib/modules";
import { DEFAULT_MODULES } from "@/lib/modules";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const [modules, colorTheme] = await Promise.all([
    getUserModules(),
    getUserColorTheme(),
  ]);

  const mod: ModuleConfig = modules ?? DEFAULT_MODULES;

  return (
    <SessionProvider session={session}>
      <ColorThemeLoader
        colorTheme={colorTheme.colorTheme}
        customPrimaryColor={colorTheme.customPrimaryColor}
        wallpaper={colorTheme.wallpaper}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:rounded-md focus:m-2 focus:shadow-lg"
      >
        Ir al contenido principal
      </a>
      <div className="flex min-h-screen">
        <Sidebar modules={mod} />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar modules={mod} />
          <main id="main-content" className="flex-1 p-4 pb-20 md:p-6 md:pb-6 lg:p-8 lg:pb-8">
            {children}
          </main>
        </div>
        <BottomNav modules={mod} />
      </div>
    </SessionProvider>
  );
}
