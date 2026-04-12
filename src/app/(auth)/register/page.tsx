"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { registerUser } from "@/actions/auth";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    if (formData.get("password") !== formData.get("confirmPassword")) {
      toast.error("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const result = await registerUser(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Cuenta creada exitosamente");
        router.push("/login");
      }
    } catch (err) {
      console.error("RegisterPage.handleSubmit:", err);
      toast.error("Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = (field: string) =>
    `h-13 rounded-2xl border-white/8 bg-white/6 text-white placeholder:text-white/25 text-[15px] px-4 focus-visible:ring-0 focus-visible:border-violet-500/50 transition-colors ${field === "password" || field === "confirmPassword" ? "pr-12" : ""}`;

  const wrapClass = (field: string) =>
    `relative rounded-2xl transition-all duration-300 ${focused === field ? "ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/10" : ""}`;

  return (
    <div className="w-full max-w-110">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-600/30 animate-auth-logo-pulse">
          <span className="text-white font-black text-3xl tracking-tighter">L4U</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Creá tu cuenta
        </h1>
        <p className="text-white/50 text-sm mt-2 font-medium">
          Empezá a organizar tu vida hoy
        </p>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-white/8 bg-white/4 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/40">
        <form onSubmit={handleSubmit} method="post" className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-widest text-white/40 pl-1">
              Nombre
            </label>
            <div className={wrapClass("name")}>
              <Input
                id="name"
                name="name"
                placeholder="Tu nombre"
                required
                onFocus={() => setFocused("name")}
                onBlur={() => setFocused(null)}
                className={inputClass("name")}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-white/40 pl-1">
              Email
            </label>
            <div className={wrapClass("email")}>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                autoComplete="email"
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                className={inputClass("email")}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-white/40 pl-1">
              Contraseña
            </label>
            <div className={wrapClass("password")}>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                className={inputClass("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-widest text-white/40 pl-1">
              Confirmar Contraseña
            </label>
            <div className={wrapClass("confirmPassword")}>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repetí tu contraseña"
                required
                onFocus={() => setFocused("confirmPassword")}
                onBlur={() => setFocused(null)}
                className={inputClass("confirmPassword")}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full h-13 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 text-white text-[15px] font-bold shadow-lg shadow-violet-600/25 hover:shadow-xl hover:shadow-violet-600/30 hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Creando cuenta...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Crear Cuenta
                  <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
              {!loading && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/6" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-[11px] font-semibold uppercase tracking-widest text-white/20 bg-transparent">
              o
            </span>
          </div>
        </div>

        {/* Login link */}
        <Link
          href="/login"
          className="flex items-center justify-center w-full h-12 rounded-2xl border border-white/8 bg-white/3 text-white/60 text-sm font-semibold hover:bg-white/6 hover:text-white/90 hover:border-white/15 transition-all duration-200"
        >
          Ya tengo una cuenta
        </Link>
      </div>

      {/* Footer */}
      <p className="text-center text-white/20 text-xs mt-8 font-medium">
        Life4U — Tu vida, organizada.
      </p>
    </div>
  );
}
