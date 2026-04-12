"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Algo salió mal</h2>
        <p className="text-muted-foreground max-w-md">
          Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
          Ir al inicio
        </Button>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </div>
  );
}
