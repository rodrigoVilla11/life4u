export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#0a0a0f]">
      {/* Animated gradient background */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Main gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-[#0a0a0f] to-indigo-950/60" />

        {/* Floating orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[100px] animate-auth-float" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/12 blur-[120px] animate-auth-float-reverse" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-fuchsia-600/8 blur-[80px] animate-auth-float" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top edge glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center animate-auth-card-in">
        {children}
      </div>
    </div>
  );
}
