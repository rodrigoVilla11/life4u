"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
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
    } catch (err) {
      console.error("LoginPage.handleSubmit:", err);
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[440px]">
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-600/30 animate-auth-logo-pulse">
          <span className="text-white font-black text-3xl tracking-tighter">L4U</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Bienvenido de nuevo
        </h1>
        <p className="text-white/50 text-sm mt-2 font-medium">
          Ingresá para retomar donde lo dejaste
        </p>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/40">
        <form onSubmit={handleSubmit} method="post" action="" className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-widest text-white/40 pl-1">
              Email
            </label>
            <div className={`relative rounded-2xl transition-all duration-300 ${focused === "email" ? "ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/10" : ""}`}>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                autoComplete="email"
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                className="h-13 rounded-2xl border-white/[0.08] bg-white/[0.06] text-white placeholder:text-white/25 text-[15px] px-4 focus-visible:ring-0 focus-visible:border-violet-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-widest text-white/40 pl-1">
              Contraseña
            </label>
            <div className={`relative rounded-2xl transition-all duration-300 ${focused === "password" ? "ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/10" : ""}`}>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Tu contraseña"
                required
                autoComplete="current-password"
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                className="h-13 rounded-2xl border-white/[0.08] bg-white/[0.06] text-white placeholder:text-white/25 text-[15px] px-4 pr-12 focus-visible:ring-0 focus-visible:border-violet-500/50 transition-colors"
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
                  Ingresando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Ingresar
                  <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
              {/* Shimmer effect */}
              {!loading && (
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/[0.06]" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 text-[11px] font-semibold uppercase tracking-widest text-white/20 bg-transparent">
              o
            </span>
          </div>
        </div>

        {/* Register link */}
        <Link
          href="/register"
          className="flex items-center justify-center w-full h-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-white/60 text-sm font-semibold hover:bg-white/[0.06] hover:text-white/90 hover:border-white/[0.15] transition-all duration-200"
        >
          Crear una cuenta nueva
        </Link>
      </div>

      {/* Footer */}
      <p className="text-center text-white/20 text-xs mt-8 font-medium">
        Life4U — Tu vida, organizada.
      </p>
    </div>
  );
}
