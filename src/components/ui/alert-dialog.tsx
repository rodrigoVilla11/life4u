"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

const AlertDialogContext = React.createContext<{ onClose: () => void }>({ onClose: () => {} })

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  const onClose = React.useCallback(() => onOpenChange?.(false), [onOpenChange])

  if (!open || !mounted) return null

  const content = (
    <AlertDialogContext.Provider value={{ onClose }}>
      <div className="fixed inset-0 z-[200]">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={onClose}
        />
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-[201] pointer-events-none"
        >
          <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        </div>
      </div>
    </AlertDialogContext.Provider>
  )

  return createPortal(content, document.body)
}

function AlertDialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-content"
      className={cn(
        "relative w-full max-w-md rounded-2xl border bg-background p-6 shadow-xl animate-in zoom-in-95",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-1.5 mb-4", className)}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-4",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { onClose } = React.useContext(AlertDialogContext)

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        onClose()
      }}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
}
