"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { WIDGET_REGISTRY, getWidgetCategories, type WidgetConfig, type WidgetDefinition } from "@/lib/dashboard/widget-registry";

interface WidgetPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWidgets: WidgetConfig[];
  onAddWidget: (definition: WidgetDefinition) => void;
}

export function WidgetPicker({ open, onOpenChange, currentWidgets, onAddWidget }: WidgetPickerProps) {
  const currentTypes = new Set(currentWidgets.map((w) => w.type));
  const available = WIDGET_REGISTRY.filter((w) => !currentTypes.has(w.type));
  const categories = getWidgetCategories();

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, WidgetDefinition[]>();
    for (const w of available) {
      if (!map.has(w.category)) map.set(w.category, []);
      map.get(w.category)!.push(w);
    }
    return Array.from(map.entries());
  }, [available]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[75vh] rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Agregar Widget</SheetTitle>
          <SheetDescription>{available.length} widgets disponibles</SheetDescription>
        </SheetHeader>

        {available.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Ya tenés todos los widgets</div>
        ) : (
          <div className="space-y-5 max-h-[55vh] overflow-y-auto pr-1 mt-2">
            {grouped.map(([category, widgets]) => (
              <div key={category}>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2 px-1">{category}</p>
                <div className="space-y-1.5">
                  {widgets.map((widget) => (
                    <div key={widget.type} className="flex items-center gap-3 p-3 rounded-xl border hover:bg-accent/40 transition-colors">
                      <span className="text-xl shrink-0">{widget.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{widget.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{widget.description}</p>
                      </div>
                      <Button size="xs" variant="outline" onClick={() => { onAddWidget(widget); }} className="gap-1 shrink-0">
                        <Plus className="h-3 w-3" /> Agregar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
