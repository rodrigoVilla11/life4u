"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface SheetContextType {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SheetContext = React.createContext<SheetContextType>({
  open: false,
  onOpenChange: () => {},
})

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function Sheet({ open: controlledOpen, onOpenChange: controlledOnOpenChange, children }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const onOpenChange = controlledOnOpenChange ?? setUncontrolledOpen

  return (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

function SheetTrigger({ children, asChild, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { onOpenChange } = React.useContext(SheetContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      onClick: (e: React.MouseEvent) => {
        onOpenChange(true);
        const childProps = (children as React.ReactElement<Record<string, unknown>>).props;
        if (typeof childProps.onClick === 'function') {
          (childProps.onClick as (e: React.MouseEvent) => void)(e);
        }
      },
    })
  }

  return (
    <button onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  )
}

function SheetClose({ children, asChild, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const { onOpenChange } = React.useContext(SheetContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      onClick: (e: React.MouseEvent) => {
        onOpenChange(false);
        const childProps = (children as React.ReactElement<Record<string, unknown>>).props;
        if (typeof childProps.onClick === 'function') {
          (childProps.onClick as (e: React.MouseEvent) => void)(e);
        }
      },
    })
  }

  return (
    <button onClick={() => onOpenChange(false)} {...props}>
      {children}
    </button>
  )
}

const sideVariants = {
  left: "inset-y-0 left-0 border-r slide-in-from-left",
  right: "inset-y-0 right-0 border-l slide-in-from-right",
  top: "inset-x-0 top-0 border-b slide-in-from-top",
  bottom: "inset-x-0 bottom-0 border-t slide-in-from-bottom",
}

interface SheetContentProps extends React.ComponentProps<"div"> {
  side?: keyof typeof sideVariants
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: SheetContentProps) {
  const { open, onOpenChange } = React.useContext(SheetContext)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!open || !mounted) return null

  const content = (
    <div className="fixed inset-0 z-[100]">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      <div
        data-slot="sheet-content"
        className={cn(
          "fixed z-[101] w-full max-w-lg bg-background p-6 shadow-xl overflow-y-auto animate-in",
          sideVariants[side],
          className
        )}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        <button
          className="absolute right-4 top-4 rounded-lg p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none z-10"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Cerrar</span>
        </button>
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 mb-6", className)}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="sheet-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6", className)}
      {...props}
    />
  )
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter }
