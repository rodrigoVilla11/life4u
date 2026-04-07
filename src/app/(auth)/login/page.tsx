"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email o contraseña incorrectos");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("Error al iniciar sesión");
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
          <h1 className="text-2xl font-bold tracking-tight">Bienvenido</h1>
          <p className="text-muted-foreground text-sm mt-1">Ingresá a tu Life4U</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Tu contraseña"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full h-12 text-[15px] font-semibold" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-primary font-semibold hover:underline underline-offset-4">
            Registrate
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
