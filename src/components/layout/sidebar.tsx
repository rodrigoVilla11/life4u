"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CheckSquare, Wallet, Building2, Target,
  BarChart3, Settings, ChevronLeft, ChevronRight, LogOut, Dumbbell, Repeat, BookOpen, CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { signOut } from "next-auth/react";
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

export function Sidebar({ modules }: { modules: ModuleConfig }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = allNavItems.filter((item) =>
    item.module === null || modules[item.module]
  );

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card/50 backdrop-blur-sm transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-[72px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center h-16 px-4 border-b">
        <Link href="/dashboard" className={cn("flex items-center gap-2.5", collapsed && "mx-auto")}>
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">L4U</span>
          </div>
          {!collapsed && <span className="font-semibold text-[17px] tracking-tight">Life4U</span>}
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t space-y-1">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent w-full transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="w-full">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
