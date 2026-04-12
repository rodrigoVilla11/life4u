"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CheckSquare, Wallet, Building2, Target,
  BarChart3, Settings, ChevronLeft, ChevronRight, LogOut, Dumbbell, Repeat, BookOpen, CalendarDays,
} from "lucide-react";
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
  { href: "/settings", label: "Ajustes", icon: Settings, module: null },
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
        "hidden md:flex flex-col border-r border-border/40 bg-sidebar transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-18" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border/40">
        <Link href="/dashboard" className={cn("flex items-center gap-3 group", collapsed && "mx-auto")}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
            <span className="text-primary-foreground font-extrabold text-xs tracking-tighter">L4U</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-[15px] tracking-tight text-foreground">
              Life4U
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav aria-label="Menú principal" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/15"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border/40 space-y-1">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Cerrar sesión"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/8 w-full transition-all duration-150",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 rounded-lg text-muted-foreground/40 hover:text-muted-foreground hover:bg-accent transition-colors"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
