import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { subDays, addDays, startOfDay } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.studySession.deleteMany();
  await prisma.studyExam.deleteMany();
  await prisma.studyScheduleBlock.deleteMany();
  await prisma.studyTopic.deleteMany();
  await prisma.studySubject.deleteMany();
  await prisma.dailyRoutineSessionItem.deleteMany();
  await prisma.dailyRoutineSession.deleteMany();
  await prisma.dailyRoutineItem.deleteMany();
  await prisma.dailyRoutine.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.workoutLogEntry.deleteMany();
  await prisma.workoutLog.deleteMany();
  await prisma.workoutExercise.deleteMany();
  await prisma.workoutDay.deleteMany();
  await prisma.workoutRoutine.deleteMany();
  await prisma.savingsGoalMovement.deleteMany();
  await prisma.savingsGoalAsset.deleteMany();
  await prisma.savingsGoalDailyEntry.deleteMany();
  await prisma.transactionTag.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.task.deleteMany();
  await prisma.taskGroup.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.transactionCategory.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.userSettings.deleteMany();
  await prisma.session.deleteMany();
  await prisma.authAccount.deleteMany();
  await prisma.user.deleteMany();

  const password = await hash("demo123", 12);
  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@life4u.app",
      password,
      settings: { create: { primaryCurrency: "USD", locale: "es", theme: "system" } },
    },
  });
  console.log("Created user:", user.email);

  // Categories
  const cats = [
    { name: "Sueldo", icon: "💼", type: "INCOME" as const },
    { name: "Freelance", icon: "💻", type: "INCOME" as const },
    { name: "Otros Ingresos", icon: "💰", type: "INCOME" as const },
    { name: "Comida", icon: "🍕", type: "EXPENSE" as const, color: "#ef4444" },
    { name: "Transporte", icon: "🚗", type: "EXPENSE" as const, color: "#f59e0b" },
    { name: "Alquiler", icon: "🏠", type: "EXPENSE" as const, color: "#8b5cf6" },
    { name: "Servicios", icon: "💡", type: "EXPENSE" as const, color: "#06b6d4" },
    { name: "Salud", icon: "🏥", type: "EXPENSE" as const, color: "#ec4899" },
    { name: "Ocio", icon: "🎮", type: "EXPENSE" as const, color: "#3b82f6" },
    { name: "Suscripciones", icon: "📺", type: "EXPENSE" as const, color: "#f97316" },
    { name: "Compras", icon: "🛍️", type: "EXPENSE" as const, color: "#d946ef" },
    { name: "Otros Gastos", icon: "📦", type: "EXPENSE" as const, color: "#6b7280" },
  ];
  const catIds: Record<string, string> = {};
  for (const c of cats) {
    const created = await prisma.transactionCategory.create({ data: { ...c, userId: user.id, isDefault: true } });
    catIds[c.name] = created.id;
  }
  console.log("Created categories");

  // Accounts
  const accs = await Promise.all([
    prisma.account.create({ data: { userId: user.id, name: "Efectivo", type: "CASH", currency: "USD", initialBalance: 500, color: "#22c55e" } }),
    prisma.account.create({ data: { userId: user.id, name: "Banco Principal", type: "BANK", currency: "USD", initialBalance: 5000, color: "#3b82f6" } }),
    prisma.account.create({ data: { userId: user.id, name: "Tarjeta de Crédito", type: "CREDIT_CARD", currency: "USD", initialBalance: 0, color: "#ef4444" } }),
    prisma.account.create({ data: { userId: user.id, name: "Mercado Pago", type: "VIRTUAL_WALLET", currency: "USD", initialBalance: 200, color: "#06b6d4" } }),
  ]);
  console.log("Created accounts");

  // Exchange Rates
  const now = new Date();
  await prisma.exchangeRate.createMany({
    data: [
      { fromCurrency: "USD", toCurrency: "EUR", rate: 0.92, date: now, userId: user.id },
      { fromCurrency: "EUR", toCurrency: "USD", rate: 1.09, date: now, userId: user.id },
      { fromCurrency: "USD", toCurrency: "ARS", rate: 875, date: now, userId: user.id },
      { fromCurrency: "ARS", toCurrency: "USD", rate: 0.00114, date: now, userId: user.id },
    ],
  });
  console.log("Created exchange rates");

  // ==========================================
  // SAVINGS GOALS (MULTI-GOAL, EXCEL STYLE)
  // ==========================================
  const today = startOfDay(now);

  // GOAL 1: Visa España - started 60 days ago, deadline in 180 days
  const visaGoal = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: "Visa España",
      description: "Ahorro para tramitar visa de trabajo y primeros meses en España",
      currency: "EUR",
      targetMin: 4000,
      targetIdeal: 6000,
      dailySavingsBase: 25,
      startDate: subDays(today, 60),
      deadline: addDays(today, 180),
      priority: "HIGH",
      category: "Viajes",
      color: "#ef4444",
      status: "ACTIVE",
    },
  });

  // Daily entries for Visa España - 60 days of history with realistic variation
  const visaDailyEntries = [];
  for (let i = 60; i >= 1; i--) {
    const date = subDays(today, i);
    // Some days have entries, some don't (weekends often skipped)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue; // Skip Sundays

    let amount: number;
    if (i % 30 < 3) amount = 50 + Math.random() * 30; // Salary days: save more
    else if (dayOfWeek === 6) amount = 10 + Math.random() * 15; // Saturdays: less
    else amount = 20 + Math.random() * 20; // Normal days

    visaDailyEntries.push({
      goalId: visaGoal.id,
      date,
      amount: Math.round(amount * 100) / 100,
      currency: "USD", // saving in USD, goal is EUR
      note: i % 15 === 0 ? "Cobro freelance" : null,
    });
  }
  await prisma.savingsGoalDailyEntry.createMany({ data: visaDailyEntries });

  // Assets for Visa España
  await prisma.savingsGoalAsset.createMany({
    data: [
      { goalId: visaGoal.id, description: "Ahorro en caja fuerte", type: "CASH", currency: "USD", amount: 500, status: "AVAILABLE" },
      { goalId: visaGoal.id, description: "Plazo fijo banco", type: "BANK_ACCOUNT", currency: "USD", amount: 800, status: "AVAILABLE" },
      { goalId: visaGoal.id, description: "Deuda de Juan", type: "RECEIVABLE", currency: "USD", amount: 200, status: "PENDING", note: "Me paga en 2 semanas" },
    ],
  });

  // Movements for Visa España
  await prisma.savingsGoalMovement.createMany({
    data: [
      { goalId: visaGoal.id, date: subDays(today, 45), description: "Consulta abogado migratorio", type: "EXPENSE", currency: "USD", amount: 150 },
      { goalId: visaGoal.id, date: subDays(today, 30), description: "Traducción de documentos", type: "EXPENSE", currency: "USD", amount: 80 },
      { goalId: visaGoal.id, date: subDays(today, 20), description: "Préstamo a amigo", type: "LOAN_GIVEN", currency: "USD", amount: 100, note: "Me devuelve en marzo" },
      { goalId: visaGoal.id, date: subDays(today, 10), description: "Bonus proyecto extra", type: "BONUS", currency: "USD", amount: 300 },
    ],
  });

  // GOAL 2: Fondo de Emergencia - started 90 days ago, no deadline
  const emergencyGoal = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: "Fondo de Emergencia",
      description: "3 meses de gastos cubiertos para cualquier imprevisto",
      currency: "USD",
      targetMin: 5000,
      targetIdeal: 8000,
      dailySavingsBase: 15,
      startDate: subDays(today, 90),
      deadline: addDays(today, 270),
      priority: "HIGH",
      category: "Seguridad",
      color: "#3b82f6",
      status: "ACTIVE",
    },
  });

  const emergencyEntries = [];
  for (let i = 90; i >= 1; i--) {
    const date = subDays(today, i);
    if (date.getDay() === 0 || Math.random() < 0.15) continue;
    const amount = 10 + Math.random() * 25;
    emergencyEntries.push({
      goalId: emergencyGoal.id, date,
      amount: Math.round(amount * 100) / 100, currency: "USD",
    });
  }
  await prisma.savingsGoalDailyEntry.createMany({ data: emergencyEntries });

  await prisma.savingsGoalAsset.createMany({
    data: [
      { goalId: emergencyGoal.id, description: "Cuenta ahorro banco", type: "BANK_ACCOUNT", currency: "USD", amount: 1200, status: "AVAILABLE" },
      { goalId: emergencyGoal.id, description: "Stablecoins USDC", type: "CRYPTO", currency: "USD", amount: 500, status: "AVAILABLE" },
    ],
  });

  await prisma.savingsGoalMovement.createMany({
    data: [
      { goalId: emergencyGoal.id, date: subDays(today, 40), description: "Gasto médico imprevisto", type: "EXPENSE", currency: "USD", amount: 200 },
    ],
  });

  // GOAL 3: Notebook Nueva - started 30 days ago, deadline in 60 days
  const notebookGoal = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: "Notebook Nueva",
      description: "MacBook Pro M4 para trabajo remoto",
      currency: "USD",
      targetMin: 1800,
      targetIdeal: 2500,
      dailySavingsBase: 20,
      startDate: subDays(today, 30),
      deadline: addDays(today, 60),
      priority: "MEDIUM",
      category: "Tecnología",
      color: "#8b5cf6",
      status: "ACTIVE",
    },
  });

  const notebookEntries = [];
  for (let i = 30; i >= 1; i--) {
    const date = subDays(today, i);
    if (date.getDay() === 0 || Math.random() < 0.1) continue;
    const amount = 15 + Math.random() * 30;
    notebookEntries.push({
      goalId: notebookGoal.id, date,
      amount: Math.round(amount * 100) / 100, currency: "USD",
    });
  }
  await prisma.savingsGoalDailyEntry.createMany({ data: notebookEntries });

  await prisma.savingsGoalAsset.createMany({
    data: [
      { goalId: notebookGoal.id, description: "Venta laptop vieja", type: "OTHER", currency: "USD", amount: 400, status: "PENDING", note: "Publicada en ML" },
    ],
  });

  // GOAL 4: Viaje Italia - just started, small goal
  const italyGoal = await prisma.savingsGoal.create({
    data: {
      userId: user.id,
      name: "Viaje Italia",
      description: "Vacaciones de 10 días en Italia",
      currency: "EUR",
      targetMin: 2000,
      targetIdeal: 3000,
      dailySavingsBase: 10,
      startDate: subDays(today, 10),
      deadline: addDays(today, 300),
      priority: "LOW",
      category: "Viajes",
      color: "#10b981",
      status: "ACTIVE",
    },
  });

  const italyEntries = [];
  for (let i = 10; i >= 1; i--) {
    const date = subDays(today, i);
    if (Math.random() < 0.2) continue;
    italyEntries.push({
      goalId: italyGoal.id, date,
      amount: Math.round((8 + Math.random() * 12) * 100) / 100,
      currency: "USD",
    });
  }
  await prisma.savingsGoalDailyEntry.createMany({ data: italyEntries });

  console.log("Created 4 savings goals with daily entries, assets, and movements");

  // ==========================================
  // TASK GROUPS WITH HIERARCHICAL TASKS
  // ==========================================
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);
  const yesterday = subDays(today, 1);

  const visaGroup = await prisma.taskGroup.create({
    data: { userId: user.id, name: "Visa España", description: "Todo para la visa", color: "#ef4444", position: 0, goalId: visaGoal.id },
  });
  const conseguirPlata = await prisma.task.create({ data: { userId: user.id, groupId: visaGroup.id, title: "Conseguir plata", priority: "HIGH", status: "IN_PROGRESS", position: 0, level: 0, goalId: visaGoal.id } });
  await prisma.task.createMany({ data: [
    { userId: user.id, groupId: visaGroup.id, parentId: conseguirPlata.id, title: "Ahorrar 1000 USD", priority: "HIGH", status: "COMPLETED", completedAt: now, position: 0, level: 1 },
    { userId: user.id, groupId: visaGroup.id, parentId: conseguirPlata.id, title: "Vender laptop vieja", priority: "MEDIUM", status: "PENDING", position: 1, level: 1 },
    { userId: user.id, groupId: visaGroup.id, parentId: conseguirPlata.id, title: "Cobrar proyecto freelance", priority: "HIGH", status: "IN_PROGRESS", dueDate: nextWeek, position: 2, level: 1 },
  ] });
  const papeles = await prisma.task.create({ data: { userId: user.id, groupId: visaGroup.id, title: "Papeles", priority: "URGENT", status: "IN_PROGRESS", position: 1, level: 0 } });
  await prisma.task.createMany({ data: [
    { userId: user.id, groupId: visaGroup.id, parentId: papeles.id, title: "Renovar pasaporte", priority: "URGENT", status: "COMPLETED", completedAt: now, position: 0, level: 1 },
    { userId: user.id, groupId: visaGroup.id, parentId: papeles.id, title: "Certificado de antecedentes", priority: "HIGH", status: "PENDING", dueDate: nextWeek, position: 1, level: 1 },
    { userId: user.id, groupId: visaGroup.id, parentId: papeles.id, title: "Seguro médico internacional", priority: "HIGH", status: "PENDING", position: 2, level: 1 },
  ] });

  const trabajoGroup = await prisma.taskGroup.create({ data: { userId: user.id, name: "Trabajo", color: "#3b82f6", position: 1 } });
  await prisma.task.createMany({ data: [
    { userId: user.id, groupId: trabajoGroup.id, title: "Presentación Q2", priority: "HIGH", status: "IN_PROGRESS", dueDate: nextWeek, position: 0, level: 0 },
    { userId: user.id, groupId: trabajoGroup.id, title: "Actualizar CV", priority: "MEDIUM", status: "PENDING", position: 1, level: 0, isFavorite: true },
  ] });

  const personalGroup = await prisma.taskGroup.create({ data: { userId: user.id, name: "Personal", color: "#22c55e", position: 2 } });
  await prisma.task.createMany({ data: [
    { userId: user.id, groupId: personalGroup.id, title: "Ir al gimnasio", priority: "MEDIUM", status: "COMPLETED", completedAt: now, dueDate: today, position: 0, level: 0 },
    { userId: user.id, groupId: personalGroup.id, title: "Comprar supermercado", priority: "MEDIUM", status: "PENDING", dueDate: tomorrow, position: 1, level: 0 },
    { userId: user.id, groupId: personalGroup.id, title: "Llamar al dentista", priority: "LOW", status: "PENDING", position: 2, level: 0 },
  ] });

  console.log("Created task groups");

  // Transactions
  const txs = [];
  for (let mo = 2; mo >= 0; mo--) {
    const m = new Date(now.getFullYear(), now.getMonth() - mo, 1);
    txs.push(
      { type: "INCOME" as const, amount: 4500, date: new Date(m.getFullYear(), m.getMonth(), 1), description: "Sueldo", categoryId: catIds["Sueldo"], accountId: accs[1].id, paymentMethod: "TRANSFER" as const, isFixed: true },
      { type: "EXPENSE" as const, amount: 1200, date: new Date(m.getFullYear(), m.getMonth(), 5), description: "Alquiler", categoryId: catIds["Alquiler"], accountId: accs[1].id, paymentMethod: "TRANSFER" as const, isFixed: true },
      { type: "EXPENSE" as const, amount: 100 + Math.floor(Math.random() * 60), date: new Date(m.getFullYear(), m.getMonth(), 7), description: "Supermercado", categoryId: catIds["Comida"], accountId: accs[0].id, paymentMethod: "CASH" as const },
      { type: "EXPENSE" as const, amount: 85, date: new Date(m.getFullYear(), m.getMonth(), 12), description: "Internet + Celular", categoryId: catIds["Servicios"], accountId: accs[1].id, paymentMethod: "DEBIT" as const, isFixed: true },
      { type: "EXPENSE" as const, amount: 45, date: new Date(m.getFullYear(), m.getMonth(), 8), description: "Suscripciones", categoryId: catIds["Suscripciones"], accountId: accs[2].id, paymentMethod: "CREDIT" as const, isFixed: true },
    );
    if (mo !== 1) txs.push({ type: "INCOME" as const, amount: 800 + Math.floor(Math.random() * 500), date: new Date(m.getFullYear(), m.getMonth(), 15), description: "Freelance", categoryId: catIds["Freelance"], accountId: accs[3].id, paymentMethod: "TRANSFER" as const });
  }
  for (const tx of txs) await prisma.transaction.create({ data: { ...tx, userId: user.id, currency: "USD" } });
  console.log("Created transactions");

  // Recurring
  await prisma.recurringTransaction.createMany({ data: [
    { userId: user.id, name: "Sueldo", type: "INCOME", amount: 4500, currency: "USD", frequency: "MONTHLY", startDate: new Date(2024, 0, 1), nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1), isActive: true },
    { userId: user.id, name: "Alquiler", type: "EXPENSE", amount: 1200, currency: "USD", frequency: "MONTHLY", startDate: new Date(2024, 0, 5), nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5), isActive: true },
    { userId: user.id, name: "Netflix", type: "EXPENSE", amount: 15, currency: "USD", frequency: "MONTHLY", startDate: new Date(2024, 0, 8), nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 8), isActive: true },
  ] });
  console.log("Created recurring transactions");

  // ==========================================
  // GYM ROUTINES
  // ==========================================

  const pushPullLegs = await prisma.workoutRoutine.create({
    data: { userId: user.id, name: "Push Pull Legs", description: "Rutina clásica de 6 días", color: "#ef4444", position: 0 },
  });

  // Push Day
  const pushDay = await prisma.workoutDay.create({
    data: { routineId: pushPullLegs.id, name: "Push (Pecho, Hombros, Tríceps)", dayOfWeek: 1, position: 0 },
  });
  await prisma.workoutExercise.createMany({ data: [
    { dayId: pushDay.id, name: "Press de Banca", muscleGroup: "Pecho", sets: 4, reps: "8-10", weight: "70kg", restSeconds: 120, position: 0 },
    { dayId: pushDay.id, name: "Press Inclinado Mancuernas", muscleGroup: "Pecho", sets: 3, reps: "10-12", weight: "24kg", restSeconds: 90, position: 1 },
    { dayId: pushDay.id, name: "Press Militar", muscleGroup: "Hombros", sets: 3, reps: "10", weight: "40kg", restSeconds: 90, position: 2 },
    { dayId: pushDay.id, name: "Elevaciones Laterales", muscleGroup: "Hombros", sets: 3, reps: "15", weight: "10kg", restSeconds: 60, position: 3 },
    { dayId: pushDay.id, name: "Fondos en Paralelas", muscleGroup: "Tríceps", sets: 3, reps: "12", weight: "bodyweight", restSeconds: 60, position: 4 },
    { dayId: pushDay.id, name: "Extensión de Tríceps Polea", muscleGroup: "Tríceps", sets: 3, reps: "12-15", restSeconds: 60, position: 5 },
  ] });

  // Pull Day
  const pullDay = await prisma.workoutDay.create({
    data: { routineId: pushPullLegs.id, name: "Pull (Espalda, Bíceps)", dayOfWeek: 2, position: 1 },
  });
  await prisma.workoutExercise.createMany({ data: [
    { dayId: pullDay.id, name: "Dominadas", muscleGroup: "Espalda", sets: 4, reps: "8-10", weight: "bodyweight", restSeconds: 120, position: 0 },
    { dayId: pullDay.id, name: "Remo con Barra", muscleGroup: "Espalda", sets: 3, reps: "10", weight: "60kg", restSeconds: 90, position: 1 },
    { dayId: pullDay.id, name: "Remo en Polea Baja", muscleGroup: "Espalda", sets: 3, reps: "12", restSeconds: 90, position: 2 },
    { dayId: pullDay.id, name: "Curl de Bíceps Barra", muscleGroup: "Bíceps", sets: 3, reps: "10-12", weight: "30kg", restSeconds: 60, position: 3 },
    { dayId: pullDay.id, name: "Curl Martillo", muscleGroup: "Bíceps", sets: 3, reps: "12", weight: "12kg", restSeconds: 60, position: 4 },
  ] });

  // Legs Day
  const legsDay = await prisma.workoutDay.create({
    data: { routineId: pushPullLegs.id, name: "Legs (Piernas, Glúteos)", dayOfWeek: 3, position: 2 },
  });
  await prisma.workoutExercise.createMany({ data: [
    { dayId: legsDay.id, name: "Sentadilla", muscleGroup: "Piernas", sets: 4, reps: "8-10", weight: "90kg", restSeconds: 150, position: 0 },
    { dayId: legsDay.id, name: "Prensa de Piernas", muscleGroup: "Piernas", sets: 3, reps: "12", weight: "150kg", restSeconds: 120, position: 1 },
    { dayId: legsDay.id, name: "Curl Femoral", muscleGroup: "Piernas", sets: 3, reps: "12", restSeconds: 90, position: 2 },
    { dayId: legsDay.id, name: "Hip Thrust", muscleGroup: "Glúteos", sets: 3, reps: "12", weight: "80kg", restSeconds: 90, position: 3 },
    { dayId: legsDay.id, name: "Extensión de Cuádriceps", muscleGroup: "Piernas", sets: 3, reps: "15", restSeconds: 60, position: 4 },
    { dayId: legsDay.id, name: "Elevación de Gemelos", muscleGroup: "Piernas", sets: 4, reps: "15-20", restSeconds: 45, position: 5 },
  ] });

  // Upper/Lower routine
  const upperLower = await prisma.workoutRoutine.create({
    data: { userId: user.id, name: "Upper / Lower", description: "Rutina de 4 días tren superior e inferior", color: "#3b82f6", position: 1 },
  });

  const upperDay = await prisma.workoutDay.create({
    data: { routineId: upperLower.id, name: "Upper Body", dayOfWeek: 1, position: 0 },
  });
  await prisma.workoutExercise.createMany({ data: [
    { dayId: upperDay.id, name: "Press de Banca", muscleGroup: "Pecho", sets: 4, reps: "8", weight: "70kg", restSeconds: 120, position: 0 },
    { dayId: upperDay.id, name: "Remo con Mancuerna", muscleGroup: "Espalda", sets: 3, reps: "10", weight: "28kg", restSeconds: 90, position: 1 },
    { dayId: upperDay.id, name: "Press Militar", muscleGroup: "Hombros", sets: 3, reps: "10", weight: "35kg", restSeconds: 90, position: 2 },
    { dayId: upperDay.id, name: "Curl de Bíceps", muscleGroup: "Bíceps", sets: 3, reps: "12", weight: "14kg", restSeconds: 60, position: 3 },
  ] });

  const lowerDay = await prisma.workoutDay.create({
    data: { routineId: upperLower.id, name: "Lower Body", dayOfWeek: 2, position: 1 },
  });
  await prisma.workoutExercise.createMany({ data: [
    { dayId: lowerDay.id, name: "Sentadilla", muscleGroup: "Piernas", sets: 4, reps: "8", weight: "80kg", restSeconds: 150, position: 0 },
    { dayId: lowerDay.id, name: "Peso Muerto Rumano", muscleGroup: "Piernas", sets: 3, reps: "10", weight: "60kg", restSeconds: 120, position: 1 },
    { dayId: lowerDay.id, name: "Prensa", muscleGroup: "Piernas", sets: 3, reps: "12", weight: "120kg", restSeconds: 90, position: 2 },
    { dayId: lowerDay.id, name: "Gemelos en Máquina", muscleGroup: "Piernas", sets: 4, reps: "15", restSeconds: 45, position: 3 },
  ] });

  console.log("Created gym routines with exercises");

  // ==========================================
  // HABITS & DAILY ROUTINES
  // ==========================================

  const waterHabit = await prisma.habit.create({
    data: { userId: user.id, title: "Tomar 2L de agua", icon: "💧", color: "#06b6d4", category: "Salud", type: "COUNT", targetValue: 8, unit: "vasos", frequencyType: "DAILY", timeOfDay: "flexible", position: 0 },
  });
  const meditateHabit = await prisma.habit.create({
    data: { userId: user.id, title: "Meditar", icon: "🧘", color: "#8b5cf6", category: "Bienestar", type: "DURATION", targetValue: 10, unit: "minutos", frequencyType: "DAILY", timeOfDay: "morning", position: 1 },
  });
  const readHabit = await prisma.habit.create({
    data: { userId: user.id, title: "Leer", icon: "📚", color: "#f59e0b", category: "Estudio", type: "COUNT", targetValue: 10, unit: "páginas", frequencyType: "DAILY", timeOfDay: "evening", position: 2 },
  });
  const saveHabit = await prisma.habit.create({
    data: { userId: user.id, title: "Ahorrar $5", icon: "💰", color: "#10b981", category: "Finanzas", type: "AMOUNT", targetValue: 5, unit: "USD", frequencyType: "WEEKDAYS", timeOfDay: "flexible", goalId: visaGoal.id, position: 3 },
  });
  const bedHabit = await prisma.habit.create({
    data: { userId: user.id, title: "Hacer la cama", icon: "🛏️", color: "#ec4899", category: "Bienestar", type: "CHECKBOX", frequencyType: "DAILY", timeOfDay: "morning", position: 4 },
  });
  const noDeliveryHabit = await prisma.habit.create({
    data: { userId: user.id, title: "No pedir delivery", icon: "🚫", color: "#ef4444", category: "Finanzas", type: "AVOID", frequencyType: "DAILY", timeOfDay: "flexible", motivationNote: "Cocinar es más sano y barato", position: 5 },
  });
  const walkHabit = await prisma.habit.create({
    data: { userId: user.id, title: "Caminar 30 min", icon: "🚶", color: "#22c55e", category: "Salud", type: "DURATION", targetValue: 30, unit: "minutos", frequencyType: "WEEKDAYS", timeOfDay: "afternoon", position: 6 },
  });

  // Habit logs - last 14 days of realistic data
  const allHabits = [waterHabit, meditateHabit, readHabit, saveHabit, bedHabit, noDeliveryHabit, walkHabit];
  for (let d = 13; d >= 0; d--) {
    const date = startOfDay(subDays(today, d));
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    for (const habit of allHabits) {
      // Skip weekday-only habits on weekends
      if (habit.frequencyType === "WEEKDAYS" && isWeekend) continue;

      // Random completion (higher chance for recent days)
      const chance = d < 3 ? 0.85 : d < 7 ? 0.7 : 0.55;
      const completed = Math.random() < chance;

      let value: number | null = null;
      if (completed) {
        if (habit.type === "COUNT" && habit.targetValue) {
          value = Math.round(habit.targetValue * (0.6 + Math.random() * 0.6));
        } else if (habit.type === "DURATION" && habit.targetValue) {
          value = Math.round(habit.targetValue * (0.7 + Math.random() * 0.5));
        } else if (habit.type === "AMOUNT" && habit.targetValue) {
          value = Math.round(habit.targetValue * (0.8 + Math.random() * 0.4));
        }
      }

      await prisma.habitLog.create({
        data: { habitId: habit.id, userId: user.id, date, completed, value },
      });
    }
  }

  // Daily Routines
  const morningRoutine = await prisma.dailyRoutine.create({
    data: { userId: user.id, name: "Rutina Mañana", icon: "🌅", color: "#f59e0b", timeOfDay: "morning", estimatedMinutes: 25, position: 0 },
  });
  await prisma.dailyRoutineItem.createMany({
    data: [
      { routineId: morningRoutine.id, habitId: waterHabit.id, title: "Tomar un vaso de agua", position: 0, duration: 1 },
      { routineId: morningRoutine.id, habitId: bedHabit.id, title: "Hacer la cama", position: 1, duration: 3 },
      { routineId: morningRoutine.id, habitId: meditateHabit.id, title: "Meditar 10 minutos", position: 2, duration: 10 },
      { routineId: morningRoutine.id, title: "Revisar objetivos del día", position: 3, duration: 5 },
      { routineId: morningRoutine.id, title: "Desayunar", position: 4, duration: 15 },
    ],
  });

  const nightRoutine = await prisma.dailyRoutine.create({
    data: { userId: user.id, name: "Rutina Noche", icon: "🌙", color: "#8b5cf6", timeOfDay: "evening", estimatedMinutes: 20, position: 1 },
  });
  await prisma.dailyRoutineItem.createMany({
    data: [
      { routineId: nightRoutine.id, habitId: readHabit.id, title: "Leer 10 páginas", position: 0, duration: 15 },
      { routineId: nightRoutine.id, title: "Preparar ropa de mañana", position: 1, duration: 3 },
      { routineId: nightRoutine.id, title: "Apagar pantallas", position: 2, duration: 1 },
      { routineId: nightRoutine.id, title: "3 gratitudes del día", position: 3, duration: 3 },
    ],
  });

  console.log("Created habits with logs and daily routines");

  // ==========================================
  // STUDY SYSTEM
  // ==========================================

  const algebra = await prisma.studySubject.create({
    data: { userId: user.id, name: "Álgebra", icon: "🧮", color: "#3b82f6", difficulty: 4, weeklyTargetHours: 6, teacher: "Prof. García", status: "active", position: 0 },
  });
  await prisma.studyTopic.createMany({ data: [
    { subjectId: algebra.id, title: "Matrices", estimatedHours: 4, completedPercent: 80, priority: 2, status: "in_progress", position: 0 },
    { subjectId: algebra.id, title: "Determinantes", estimatedHours: 3, completedPercent: 60, priority: 1, status: "in_progress", position: 1 },
    { subjectId: algebra.id, title: "Sistemas de ecuaciones", estimatedHours: 5, completedPercent: 20, priority: 2, status: "pending", position: 2 },
    { subjectId: algebra.id, title: "Espacios vectoriales", estimatedHours: 6, completedPercent: 0, priority: 0, status: "pending", position: 3 },
  ] });
  await prisma.studyExam.create({ data: { subjectId: algebra.id, title: "Parcial 1 - Álgebra", date: addDays(today, 12), priority: 2, status: "studying" } });
  await prisma.studyScheduleBlock.createMany({ data: [
    { subjectId: algebra.id, dayOfWeek: 1, startTime: "18:00", endTime: "20:00" },
    { subjectId: algebra.id, dayOfWeek: 3, startTime: "18:00", endTime: "20:00" },
  ] });

  const italiano = await prisma.studySubject.create({
    data: { userId: user.id, name: "Italiano", icon: "🌍", color: "#10b981", difficulty: 2, weeklyTargetHours: 3, status: "active", position: 1 },
  });
  await prisma.studyTopic.createMany({ data: [
    { subjectId: italiano.id, title: "Vocabulario básico", estimatedHours: 2, completedPercent: 90, priority: 1, status: "in_progress", position: 0 },
    { subjectId: italiano.id, title: "Verbos regulares", estimatedHours: 3, completedPercent: 50, priority: 2, status: "in_progress", position: 1 },
    { subjectId: italiano.id, title: "Conjugaciones", estimatedHours: 4, completedPercent: 10, priority: 1, status: "pending", position: 2 },
  ] });
  await prisma.studyScheduleBlock.create({ data: { subjectId: italiano.id, dayOfWeek: 2, startTime: "10:00", endTime: "11:00" } });

  const programacion = await prisma.studySubject.create({
    data: { userId: user.id, name: "Programación", icon: "💻", color: "#8b5cf6", difficulty: 3, weeklyTargetHours: 8, teacher: "Prof. López", status: "active", position: 2 },
  });
  await prisma.studyTopic.createMany({ data: [
    { subjectId: programacion.id, title: "Variables y tipos", estimatedHours: 2, completedPercent: 100, priority: 0, status: "completed", position: 0 },
    { subjectId: programacion.id, title: "Condicionales", estimatedHours: 3, completedPercent: 70, priority: 1, status: "in_progress", position: 1 },
    { subjectId: programacion.id, title: "Funciones", estimatedHours: 4, completedPercent: 30, priority: 2, status: "in_progress", position: 2 },
    { subjectId: programacion.id, title: "POO", estimatedHours: 6, completedPercent: 0, priority: 2, status: "pending", position: 3 },
  ] });
  await prisma.studyExam.create({ data: { subjectId: programacion.id, title: "TP Final - Programación", date: addDays(today, 25), priority: 2, status: "pending" } });
  await prisma.studyScheduleBlock.createMany({ data: [
    { subjectId: programacion.id, dayOfWeek: 4, startTime: "19:00", endTime: "21:00" },
    { subjectId: programacion.id, dayOfWeek: 5, startTime: "16:00", endTime: "18:00" },
  ] });

  // Study sessions (last 2 weeks)
  const subjects = [algebra, italiano, programacion];
  for (let d = 13; d >= 0; d--) {
    if (Math.random() < 0.4) continue; // skip some days
    const subj = subjects[Math.floor(Math.random() * subjects.length)];
    const dur = [25, 50, 75, 90][Math.floor(Math.random() * 4)];
    const pomodoros = Math.floor(dur / 25);
    await prisma.studySession.create({
      data: {
        userId: user.id,
        subjectId: subj.id,
        method: Math.random() > 0.3 ? "pomodoro_25_5" : "deep_work",
        status: "completed",
        actualStart: subDays(today, d),
        actualEnd: subDays(today, d),
        actualDurationMin: dur,
        pomodoroCompleted: pomodoros,
        focusScore: Math.floor(Math.random() * 3) + 3,
      },
    });
  }

  console.log("Created study subjects with topics, exams, schedule, and sessions");

  console.log("\n✅ Seed completed!");
  console.log("📧 Login: demo@life4u.app");
  console.log("🔑 Password: demo123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
