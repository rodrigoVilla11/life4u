"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { createContext, useContext, useEffect, useState } from "react";
import { applyColorTheme } from "@/lib/color-themes";

interface ColorThemeContextType {
  colorTheme: string;
  setColorTheme: (id: string) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType>({
  colorTheme: "default",
  setColorTheme: () => {},
});

export function useColorTheme() {
  return useContext(ColorThemeContext);
}

function ColorThemeApplier({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const { colorTheme } = useColorTheme();

  useEffect(() => {
    applyColorTheme(colorTheme, resolvedTheme === "dark");
  }, [colorTheme, resolvedTheme]);

  return <>{children}</>;
}

export function Providers({
  children,
  initialColorTheme = "default",
}: {
  children: React.ReactNode;
  initialColorTheme?: string;
}) {
  const [colorTheme, setColorTheme] = useState(initialColorTheme);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
        <ColorThemeApplier>
          {children}
        </ColorThemeApplier>
      </ColorThemeContext.Provider>
      <Toaster position="bottom-right" richColors closeButton />
    </ThemeProvider>
  );
}
