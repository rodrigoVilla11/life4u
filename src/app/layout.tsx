import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "Life4U - Productividad Personal",
    template: "%s | Life4U",
  },
  description:
    "Organiza tareas, controla gastos e ingresos, alcanza tus metas de ahorro, trackea hábitos y rutinas de gym.",
  keywords: ["productividad", "finanzas", "tareas", "metas", "hábitos", "gym", "estudio"],
  openGraph: {
    title: "Life4U - Productividad Personal",
    description:
      "Organiza tareas, controla gastos e ingresos, alcanza tus metas de ahorro.",
    type: "website",
    locale: "es_AR",
    siteName: "Life4U",
  },
  twitter: {
    card: "summary",
    title: "Life4U - Productividad Personal",
    description:
      "Organiza tareas, controla gastos e ingresos, alcanza tus metas de ahorro.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
