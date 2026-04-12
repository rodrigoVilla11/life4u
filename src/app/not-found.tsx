import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="rounded-full bg-muted p-4">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Página no encontrada</h2>
        <p className="text-muted-foreground max-w-md">
          La página que buscás no existe o fue movida.
        </p>
      </div>
      <Link href="/dashboard">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
