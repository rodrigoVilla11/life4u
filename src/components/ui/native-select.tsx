import { cn } from "@/lib/utils"
import * as React from "react"

const NativeSelect = React.forwardRef<HTMLSelectElement, React.ComponentProps<"select">>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        style={{ backgroundColor: "var(--select-bg)" }}
        className={cn(
          "flex h-11 w-full rounded-xl border border-input text-foreground px-3.5 py-2 text-[15px] leading-tight shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:text-sm",
          className
        )}
        {...props}
      />
    )
  }
)
NativeSelect.displayName = "NativeSelect"

export { NativeSelect }
