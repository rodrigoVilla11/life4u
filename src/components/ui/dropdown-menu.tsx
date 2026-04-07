"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
})

function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({
  className,
  children,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)
  return (
    <button
      type="button"
      className={cn(className)}
      onClick={(e) => {
        e.stopPropagation()
        setOpen(!open)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuContent({
  className,
  children,
  align = "end",
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "end" }) {
  const { open, setOpen } = React.useContext(DropdownMenuContext)

  React.useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      data-slot="dropdown-menu-content"
      className={cn(
        "absolute z-50 min-w-[8rem] rounded-lg border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95",
        align === "end" ? "right-0" : "left-0",
        "top-full mt-1",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuItem({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  const { setOpen } = React.useContext(DropdownMenuContext)
  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      onClick={(e) => {
        props.onClick?.(e)
        setOpen(false)
      }}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
