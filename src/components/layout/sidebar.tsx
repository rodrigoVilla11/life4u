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
        "hidden md:flex flex-col border-r border-border/50 bg-card/60 backdrop-blur-xl transition-all duration-300 h-screen sticky top-0",
        collapsed ? "w-18" : "w-62.5"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-border/50">
        <Link href="/dashboard" className={cn("flex items-center gap-2.5 group", collapsed && "mx-auto")}>
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30 transition-shadow">
            <span className="text-primary-foreground font-black text-sm tracking-tighter">L4U</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-[17px] tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Life4U
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav aria-label="Menú principal" className="flex-1 p-2.5 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/80",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn(
                "h-4.5 w-4.5 shrink-0 transition-transform duration-200",
                !isActive && "group-hover:scale-110"
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2.5 border-t border-border/50 space-y-1">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="Cerrar sesión"
          className={cn(
            "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-muted-foreground hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200",
            collapsed && "justify-center px-2"
          )}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-muted-foreground/50 hover:text-muted-foreground"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
