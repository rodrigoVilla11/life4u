"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileSidebar } from "./mobile-sidebar";
import { useState } from "react";

export function Topbar({ modules: _modules }: { modules?: import("@/lib/modules").ModuleConfig }) {
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 md:h-16 items-center gap-3 border-b border-border/50 bg-card/60 backdrop-blur-xl px-4 md:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Abrir menú">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px]">
          <MobileSidebar modules={_modules} />
        </SheetContent>
      </Sheet>

      {/* Search */}
      <div className="flex-1 max-w-md">
        {searchOpen ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9 h-9 md:h-10 rounded-xl bg-accent/50 border-border/50"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full max-w-sm justify-start text-muted-foreground gap-2 h-9 rounded-xl border-border/50 bg-accent/30 hover:bg-accent/60"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden md:inline ml-auto pointer-events-none select-none rounded-lg border border-border/50 bg-card/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
              Ctrl+K
            </kbd>
          </Button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative overflow-hidden"
        >
          <Sun className="h-4.5 w-4.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4.5 w-4.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </div>
    </header>
  );
}
