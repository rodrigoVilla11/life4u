import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 shadow-inner">
        <Icon className="h-7 w-7 text-primary/60" />
      </div>
      <h3 className="text-lg font-bold tracking-tight mb-1.5">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="shadow-md shadow-primary/20">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
