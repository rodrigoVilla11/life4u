"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, CheckSquare, Wallet, Target, Repeat } from "lucide-react";
import type { ModuleConfig } from "@/lib/modules";

const allItems = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard, module: null },
  { href: "/tasks", label: "Tareas", icon: CheckSquare, module: "tasks" as const },
  { href: "/finances", label: "Finanzas", icon: Wallet, module: "finances" as const },
  { href: "/goals", label: "Metas", icon: Target, module: "goals" as const },
  { href: "/habits", label: "Hábitos", icon: Repeat, module: "habits" as const },
];

export function BottomNav({ modules }: { modules: ModuleConfig }) {
  const pathname = usePathname();

  const navItems = allItems.filter((item) =>
    item.module === null || modules[item.module]
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 rounded-xl transition-colors min-h-[44px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className={cn("text-[10px] leading-tight", isActive ? "font-semibold" : "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
