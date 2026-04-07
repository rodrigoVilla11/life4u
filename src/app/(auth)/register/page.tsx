"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { registerUser } from "@/actions/auth";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await registerUser(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Cuenta creada exitosamente");
        router.push("/login");
      }
    } catch {
      toast.error("Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-[420px] shadow-lg border-0 md:border md:shadow-xl">
      <CardContent className="p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-md">
            <span className="text-primary-foreground font-bold text-xl">L4U</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Crear Cuenta</h1>
          <p className="text-muted-foreground text-sm mt-1">Empezá a organizar tu vida hoy</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Nombre</Label>
            <Input id="name" name="name" placeholder="Tu nombre" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repetí tu contraseña"
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 text-[15px] font-semibold" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline underline-offset-4">
            Iniciar Sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
