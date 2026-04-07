import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const DEFAULT_TIMEZONE = "America/Argentina/Buenos_Aires";

export async function getRequiredUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getUserModules() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
    select: {
      moduleTasksEnabled: true,
      moduleFinancesEnabled: true,
      moduleAccountsEnabled: true,
      moduleGoalsEnabled: true,
      moduleReportsEnabled: true,
      moduleGymEnabled: true,
      moduleHabitsEnabled: true,
      moduleStudyEnabled: true,
      moduleCalendarEnabled: true,
    },
  });

  return settings ? {
    tasks: settings.moduleTasksEnabled,
    finances: settings.moduleFinancesEnabled,
    accounts: settings.moduleAccountsEnabled,
    goals: settings.moduleGoalsEnabled,
    reports: settings.moduleReportsEnabled,
    gym: settings.moduleGymEnabled,
    habits: settings.moduleHabitsEnabled,
    study: settings.moduleStudyEnabled,
    calendar: settings.moduleCalendarEnabled,
  } : null;
}

export async function getUserColorTheme(): Promise<{ colorTheme: string; customPrimaryColor: string | null; wallpaper: string | null }> {
  const session = await auth();
  if (!session?.user?.id) return { colorTheme: "default", customPrimaryColor: null, wallpaper: null };

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
    select: { colorTheme: true, customPrimaryColor: true, dashboardWallpaper: true },
  });

  return {
    colorTheme: settings?.colorTheme ?? "default",
    customPrimaryColor: settings?.customPrimaryColor ?? null,
    wallpaper: settings?.dashboardWallpaper ?? null,
  };
}

export async function getUserTimezone(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) return DEFAULT_TIMEZONE;

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
    select: { timezone: true },
  });

  return settings?.timezone ?? DEFAULT_TIMEZONE;
}
