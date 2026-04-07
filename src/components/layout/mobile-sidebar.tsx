"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CheckSquare, Wallet, Building2, Target,
  BarChart3, Settings, LogOut, Dumbbell, Repeat, BookOpen, CalendarDays,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { SheetClose } from "@/components/ui/sheet";
import type { ModuleConfig } from "@/lib/modules";

const allNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, module: null },
  { href: "/tasks", label: "Tareas", icon: CheckSquare, module: "tasks" as const },
  { href: "/finances", label: "Finanzas", icon: Wallet, module: "finances" as const },
  { href: "/accounts", label: "Cuentas", icon: Building2, module: "accounts" as const },
  { href: "/goals", label: "Metas", icon: Target, module: "goals" as const },
  { href: "/reports", label: "Reportes", icon: BarChart3, module: "reports" as const },
  { href: "/gym", label: "Gimnasio", icon: Dumbbell, module: "gym" as const },
  { href: "/habits", label: "Hábitos", icon: Repeat, module: "habits" as const },
  { href: "/study", label: "Estudio", icon: BookOpen, module: "study" as const },
  { href: "/calendar", label: "Calendario", icon: CalendarDays, module: "calendar" as const },
  { href: "/settings", label: "Configuración", icon: Settings, module: null },
];

export function MobileSidebar({ modules }: { modules?: ModuleConfig }) {
  const pathname = usePathname();

  const navItems = allNavItems.filter((item) =>
    item.module === null || !modules || modules[item.module]
  );

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center h-16 px-5 border-b">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L4U</span>
          </div>
          <span className="font-semibold text-[17px] tracking-tight">Life4U</span>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <SheetClose key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-3 rounded-xl text-[15px] font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </SheetClose>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-[15px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
