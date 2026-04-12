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
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-6 text-center animate-fade-in-up">
      <div className="h-14 w-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-5">
        <Icon className="h-6 w-6 text-primary/50" />
      </div>
      <h3 className="text-base font-semibold tracking-tight mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
