"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/schemas/auth";
import { DEFAULT_INCOME_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from "@/lib/constants";

export async function registerUser(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = registerSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { name, email, password } = result.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "El email ya está registrado" };
  }

  const hashedPassword = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      settings: {
        create: {
          primaryCurrency: "USD",
          locale: "es",
          theme: "system",
        },
      },
    },
  });

  // Create default categories for the user
  const incomeCategories = DEFAULT_INCOME_CATEGORIES.map((cat) => ({
    userId: user.id,
    name: cat.name,
    type: "INCOME" as const,
    icon: cat.icon,
    isDefault: true,
  }));

  const expenseCategories = DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
    userId: user.id,
    name: cat.name,
    type: "EXPENSE" as const,
    icon: cat.icon,
    isDefault: true,
  }));

  await prisma.transactionCategory.createMany({
    data: [...incomeCategories, ...expenseCategories],
  });

  return { success: true };
}

export async function loginUser(formData: FormData) {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = loginSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    await signIn("credentials", {
      email: raw.email,
      password: raw.password,
      redirectTo: "/dashboard",
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "type" in error && (error as { type: string }).type === "CredentialsSignin") {
      return { error: "Email o contraseña incorrectos" };
    }
    throw error;
  }
}
