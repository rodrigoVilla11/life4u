export interface ExerciseTemplate {
  id: string;
  name: string;
  muscleGroup: string;
  secondaryMuscles: string[];
  equipment: string;
  instructions: string;
  image: string; // URL to illustration
  difficulty: "beginner" | "intermediate" | "advanced";
}

// Muscle group colors for visualization
export const MUSCLE_COLORS: Record<string, string> = {
  Pecho: "#ef4444",
  Espalda: "#3b82f6",
  Hombros: "#f59e0b",
  Bíceps: "#8b5cf6",
  Tríceps: "#ec4899",
  Piernas: "#10b981",
  Glúteos: "#f97316",
  Abdominales: "#06b6d4",
  Cardio: "#22c55e",
  "Full Body": "#6366f1",
  Antebrazos: "#a855f7",
  Trapecio: "#0ea5e9",
};

// Using musclewiki-style SVG illustrations via public API
// These are placeholder URLs - in production you'd use your own CDN or Cloudinary
const IMG = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

export const EXERCISE_DATABASE: ExerciseTemplate[] = [
  // ==========================================
  // PECHO
  // ==========================================
  {
    id: "bench-press",
    name: "Press de Banca",
    muscleGroup: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    equipment: "Barra",
    instructions: "Acostado en banco plano, agarre medio. Bajá la barra al pecho controladamente y empujá hacia arriba.",
    image: `${IMG}/Barbell_Bench_Press/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "incline-bench-press",
    name: "Press Inclinado con Barra",
    muscleGroup: "Pecho",
    secondaryMuscles: ["Hombros", "Tríceps"],
    equipment: "Barra",
    instructions: "Banco inclinado a 30-45°. Bajá la barra al pecho superior y empujá.",
    image: `${IMG}/Barbell_Incline_Bench_Press/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "dumbbell-bench-press",
    name: "Press de Banca con Mancuernas",
    muscleGroup: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    equipment: "Mancuernas",
    instructions: "Acostado en banco plano con una mancuerna en cada mano. Empujá hacia arriba y juntá arriba.",
    image: `${IMG}/Dumbbell_Bench_Press/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "incline-dumbbell-press",
    name: "Press Inclinado con Mancuernas",
    muscleGroup: "Pecho",
    secondaryMuscles: ["Hombros", "Tríceps"],
    equipment: "Mancuernas",
    instructions: "Banco inclinado 30-45°. Press con mancuernas enfocando pecho superior.",
    image: `${IMG}/Dumbbell_Incline_Bench_Press/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "chest-fly",
    name: "Aperturas con Mancuernas",
    muscleGroup: "Pecho",
    secondaryMuscles: ["Hombros"],
    equipment: "Mancuernas",
    instructions: "Banco plano, brazos extendidos. Abrí los brazos en arco controlado y volvé a juntar.",
    image: `${IMG}/Dumbbell_Fly/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "cable-crossover",
    name: "Cruces en Polea",
    muscleGroup: "Pecho",
    secondaryMuscles: ["Hombros"],
    equipment: "Poleas",
    instructions: "De pie entre poleas altas. Llevá las manos hacia el centro cruzando frente al pecho.",
    image: `${IMG}/Cable_Crossover/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "push-ups",
    name: "Flexiones de Brazos",
    muscleGroup: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros", "Abdominales"],
    equipment: "Peso corporal",
    instructions: "Posición de plancha, manos al ancho de hombros. Bajá el pecho al piso y empujá.",
    image: `${IMG}/Push-Up/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "dips",
    name: "Fondos en Paralelas",
    muscleGroup: "Pecho",
    secondaryMuscles: ["Tríceps", "Hombros"],
    equipment: "Paralelas",
    instructions: "En paralelas, inclinación hacia adelante. Bajá hasta 90° en codos y empujá.",
    image: `${IMG}/Chest_Dip/0.jpg`,
    difficulty: "intermediate",
  },

  // ==========================================
  // ESPALDA
  // ==========================================
  {
    id: "pull-ups",
    name: "Dominadas",
    muscleGroup: "Espalda",
    secondaryMuscles: ["Bíceps", "Antebrazos"],
    equipment: "Barra fija",
    instructions: "Agarre prono al ancho de hombros. Tirá el cuerpo hacia arriba hasta pasar la barra con el mentón.",
    image: `${IMG}/Pull-Up/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "lat-pulldown",
    name: "Jalón al Pecho",
    muscleGroup: "Espalda",
    secondaryMuscles: ["Bíceps"],
    equipment: "Polea alta",
    instructions: "Sentado en máquina, agarre ancho. Tirá la barra hacia el pecho sacando pecho.",
    image: `${IMG}/Lat_Pulldown/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "barbell-row",
    name: "Remo con Barra",
    muscleGroup: "Espalda",
    secondaryMuscles: ["Bíceps", "Trapecio"],
    equipment: "Barra",
    instructions: "Inclinado 45°, espalda recta. Tirá la barra hacia el abdomen y bajá controlado.",
    image: `${IMG}/Barbell_Bent_Over_Row/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "dumbbell-row",
    name: "Remo con Mancuerna",
    muscleGroup: "Espalda",
    secondaryMuscles: ["Bíceps", "Trapecio"],
    equipment: "Mancuerna",
    instructions: "Una rodilla y mano en banco. Tirá la mancuerna hacia la cadera.",
    image: `${IMG}/Dumbbell_Row/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "cable-row",
    name: "Remo en Polea Baja",
    muscleGroup: "Espalda",
    secondaryMuscles: ["Bíceps", "Trapecio"],
    equipment: "Polea baja",
    instructions: "Sentado, pies en plataforma. Tirá el agarre hacia el abdomen, apretá escápulas.",
    image: `${IMG}/Seated_Cable_Row/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "deadlift",
    name: "Peso Muerto",
    muscleGroup: "Espalda",
    secondaryMuscles: ["Piernas", "Glúteos", "Trapecio"],
    equipment: "Barra",
    instructions: "Pies al ancho de caderas, agarre mixto o prono. Levantá la barra manteniendo espalda neutra.",
    image: `${IMG}/Barbell_Deadlift/0.jpg`,
    difficulty: "advanced",
  },
  {
    id: "face-pull",
    name: "Face Pull",
    muscleGroup: "Espalda",
    secondaryMuscles: ["Hombros", "Trapecio"],
    equipment: "Polea alta",
    instructions: "Polea alta con cuerda. Tirá hacia la cara separando las manos, apretá escápulas.",
    image: `${IMG}/Face_Pull/0.jpg`,
    difficulty: "beginner",
  },

  // ==========================================
  // HOMBROS
  // ==========================================
  {
    id: "overhead-press",
    name: "Press Militar",
    muscleGroup: "Hombros",
    secondaryMuscles: ["Tríceps", "Trapecio"],
    equipment: "Barra",
    instructions: "De pie o sentado, barra a la altura de hombros. Empujá hacia arriba sobre la cabeza.",
    image: `${IMG}/Barbell_Overhead_Press/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "dumbbell-shoulder-press",
    name: "Press de Hombros con Mancuernas",
    muscleGroup: "Hombros",
    secondaryMuscles: ["Tríceps"],
    equipment: "Mancuernas",
    instructions: "Sentado, mancuernas a la altura de orejas. Empujá hacia arriba.",
    image: `${IMG}/Dumbbell_Shoulder_Press/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "lateral-raises",
    name: "Elevaciones Laterales",
    muscleGroup: "Hombros",
    secondaryMuscles: [],
    equipment: "Mancuernas",
    instructions: "De pie, mancuernas a los lados. Elevá los brazos lateralmente hasta la altura de hombros.",
    image: `${IMG}/Dumbbell_Lateral_Raise/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "front-raises",
    name: "Elevaciones Frontales",
    muscleGroup: "Hombros",
    secondaryMuscles: ["Pecho"],
    equipment: "Mancuernas",
    instructions: "De pie, mancuernas al frente. Elevá un brazo a la vez hasta la altura de hombros.",
    image: `${IMG}/Dumbbell_Front_Raise/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "reverse-fly",
    name: "Pájaro (Reverse Fly)",
    muscleGroup: "Hombros",
    secondaryMuscles: ["Espalda", "Trapecio"],
    equipment: "Mancuernas",
    instructions: "Inclinado hacia adelante. Abrí los brazos lateralmente apretando escápulas.",
    image: `${IMG}/Dumbbell_Reverse_Fly/0.jpg`,
    difficulty: "beginner",
  },

  // ==========================================
  // BÍCEPS
  // ==========================================
  {
    id: "barbell-curl",
    name: "Curl de Bíceps con Barra",
    muscleGroup: "Bíceps",
    secondaryMuscles: ["Antebrazos"],
    equipment: "Barra",
    instructions: "De pie, agarre supino. Flexioná los codos llevando la barra hacia los hombros.",
    image: `${IMG}/Barbell_Curl/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "dumbbell-curl",
    name: "Curl con Mancuernas",
    muscleGroup: "Bíceps",
    secondaryMuscles: ["Antebrazos"],
    equipment: "Mancuernas",
    instructions: "De pie o sentado, alternando brazos. Curl controlado con supinación.",
    image: `${IMG}/Dumbbell_Curl/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "hammer-curl",
    name: "Curl Martillo",
    muscleGroup: "Bíceps",
    secondaryMuscles: ["Antebrazos"],
    equipment: "Mancuernas",
    instructions: "Agarre neutro (palmas enfrentadas). Curl sin rotar las muñecas.",
    image: `${IMG}/Dumbbell_Hammer_Curl/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "preacher-curl",
    name: "Curl en Banco Scott",
    muscleGroup: "Bíceps",
    secondaryMuscles: [],
    equipment: "Barra EZ / Mancuerna",
    instructions: "Brazos apoyados en el banco predicador. Curl concentrado sin impulso.",
    image: `${IMG}/Barbell_Preacher_Curl/0.jpg`,
    difficulty: "beginner",
  },

  // ==========================================
  // TRÍCEPS
  // ==========================================
  {
    id: "tricep-pushdown",
    name: "Extensión de Tríceps en Polea",
    muscleGroup: "Tríceps",
    secondaryMuscles: [],
    equipment: "Polea alta",
    instructions: "De pie frente a polea alta. Empujá hacia abajo extendiendo codos, sin mover los brazos.",
    image: `${IMG}/Tricep_Pushdown/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "overhead-tricep-extension",
    name: "Extensión de Tríceps Overhead",
    muscleGroup: "Tríceps",
    secondaryMuscles: [],
    equipment: "Mancuerna / Polea",
    instructions: "Mancuerna detrás de la cabeza con ambas manos. Extendé los codos hacia arriba.",
    image: `${IMG}/Dumbbell_Overhead_Tricep_Extension/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "skull-crushers",
    name: "Skull Crushers",
    muscleGroup: "Tríceps",
    secondaryMuscles: [],
    equipment: "Barra EZ",
    instructions: "Acostado en banco. Bajá la barra hacia la frente flexionando codos y extendé.",
    image: `${IMG}/EZ-Bar_Skullcrusher/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "close-grip-bench",
    name: "Press Banca Agarre Cerrado",
    muscleGroup: "Tríceps",
    secondaryMuscles: ["Pecho", "Hombros"],
    equipment: "Barra",
    instructions: "Press de banca con manos al ancho de hombros o más juntas.",
    image: `${IMG}/Close-Grip_Barbell_Bench_Press/0.jpg`,
    difficulty: "intermediate",
  },

  // ==========================================
  // PIERNAS
  // ==========================================
  {
    id: "squat",
    name: "Sentadilla",
    muscleGroup: "Piernas",
    secondaryMuscles: ["Glúteos", "Abdominales"],
    equipment: "Barra",
    instructions: "Barra en espalda alta. Bajá flexionando rodillas y caderas hasta paralelo o más.",
    image: `${IMG}/Barbell_Squat/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "front-squat",
    name: "Sentadilla Frontal",
    muscleGroup: "Piernas",
    secondaryMuscles: ["Glúteos", "Abdominales"],
    equipment: "Barra",
    instructions: "Barra en deltoides frontales. Bajá manteniendo torso más vertical.",
    image: `${IMG}/Barbell_Front_Squat/0.jpg`,
    difficulty: "advanced",
  },
  {
    id: "leg-press",
    name: "Prensa de Piernas",
    muscleGroup: "Piernas",
    secondaryMuscles: ["Glúteos"],
    equipment: "Máquina",
    instructions: "Pies al ancho de hombros en plataforma. Bajá hasta 90° y empujá.",
    image: `${IMG}/Leg_Press/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "leg-extension",
    name: "Extensión de Cuádriceps",
    muscleGroup: "Piernas",
    secondaryMuscles: [],
    equipment: "Máquina",
    instructions: "Sentado en máquina. Extendé las piernas contra la resistencia.",
    image: `${IMG}/Leg_Extension/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "leg-curl",
    name: "Curl Femoral",
    muscleGroup: "Piernas",
    secondaryMuscles: [],
    equipment: "Máquina",
    instructions: "Boca abajo o sentado. Flexioná las piernas contra la resistencia.",
    image: `${IMG}/Leg_Curl/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "romanian-deadlift",
    name: "Peso Muerto Rumano",
    muscleGroup: "Piernas",
    secondaryMuscles: ["Glúteos", "Espalda"],
    equipment: "Barra / Mancuernas",
    instructions: "Piernas semi-extendidas. Bajá la barra por las piernas con espalda neutra.",
    image: `${IMG}/Barbell_Romanian_Deadlift/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "lunges",
    name: "Estocadas / Lunges",
    muscleGroup: "Piernas",
    secondaryMuscles: ["Glúteos"],
    equipment: "Mancuernas / Peso corporal",
    instructions: "Paso largo hacia adelante. Bajá la rodilla trasera hacia el piso.",
    image: `${IMG}/Dumbbell_Lunge/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "calf-raises",
    name: "Elevación de Gemelos",
    muscleGroup: "Piernas",
    secondaryMuscles: [],
    equipment: "Máquina / Peso corporal",
    instructions: "De pie, elevá los talones al máximo y bajá controlado.",
    image: `${IMG}/Calf_Raise/0.jpg`,
    difficulty: "beginner",
  },

  // ==========================================
  // GLÚTEOS
  // ==========================================
  {
    id: "hip-thrust",
    name: "Hip Thrust",
    muscleGroup: "Glúteos",
    secondaryMuscles: ["Piernas"],
    equipment: "Barra / Banco",
    instructions: "Espalda en banco, barra en cadera. Empujá caderas hacia arriba apretando glúteos.",
    image: `${IMG}/Barbell_Hip_Thrust/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "glute-bridge",
    name: "Puente de Glúteos",
    muscleGroup: "Glúteos",
    secondaryMuscles: ["Piernas"],
    equipment: "Peso corporal",
    instructions: "Acostado, rodillas flexionadas. Elevá caderas apretando glúteos.",
    image: `${IMG}/Glute_Bridge/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "bulgarian-split-squat",
    name: "Sentadilla Búlgara",
    muscleGroup: "Glúteos",
    secondaryMuscles: ["Piernas"],
    equipment: "Mancuernas / Banco",
    instructions: "Pie trasero en banco. Bajá flexionando la rodilla delantera.",
    image: `${IMG}/Dumbbell_Bulgarian_Split_Squat/0.jpg`,
    difficulty: "intermediate",
  },

  // ==========================================
  // ABDOMINALES
  // ==========================================
  {
    id: "crunches",
    name: "Crunches",
    muscleGroup: "Abdominales",
    secondaryMuscles: [],
    equipment: "Peso corporal",
    instructions: "Acostado, rodillas flexionadas. Elevá hombros del piso contrayendo abdomen.",
    image: `${IMG}/Crunch/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "plank",
    name: "Plancha",
    muscleGroup: "Abdominales",
    secondaryMuscles: ["Hombros", "Espalda"],
    equipment: "Peso corporal",
    instructions: "Posición de plancha en antebrazos. Mantené el cuerpo recto.",
    image: `${IMG}/Front_Plank/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "hanging-leg-raise",
    name: "Elevación de Piernas Colgado",
    muscleGroup: "Abdominales",
    secondaryMuscles: [],
    equipment: "Barra fija",
    instructions: "Colgado de barra. Elevá las piernas rectas o con rodillas flexionadas.",
    image: `${IMG}/Hanging_Leg_Raise/0.jpg`,
    difficulty: "intermediate",
  },
  {
    id: "russian-twist",
    name: "Giro Ruso",
    muscleGroup: "Abdominales",
    secondaryMuscles: [],
    equipment: "Peso corporal / Mancuerna",
    instructions: "Sentado, pies elevados. Rotá el torso de lado a lado.",
    image: `${IMG}/Russian_Twist/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "cable-crunch",
    name: "Crunch en Polea",
    muscleGroup: "Abdominales",
    secondaryMuscles: [],
    equipment: "Polea alta",
    instructions: "De rodillas frente a polea. Flexioná el torso hacia abajo contrayendo abdomen.",
    image: `${IMG}/Cable_Crunch/0.jpg`,
    difficulty: "beginner",
  },

  // ==========================================
  // CARDIO
  // ==========================================
  {
    id: "treadmill",
    name: "Cinta / Correr",
    muscleGroup: "Cardio",
    secondaryMuscles: ["Piernas"],
    equipment: "Cinta / Exterior",
    instructions: "Correr a ritmo constante o intervalos.",
    image: `${IMG}/Treadmill_Running/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "rowing-machine",
    name: "Remo Ergómetro",
    muscleGroup: "Cardio",
    secondaryMuscles: ["Espalda", "Piernas"],
    equipment: "Remo",
    instructions: "Movimiento completo: empujá con piernas, tirá con espalda, volvé controlado.",
    image: `${IMG}/Rowing_Machine/0.jpg`,
    difficulty: "beginner",
  },
  {
    id: "jump-rope",
    name: "Saltar la Soga",
    muscleGroup: "Cardio",
    secondaryMuscles: ["Piernas", "Hombros"],
    equipment: "Soga",
    instructions: "Saltos cortos con muñecas rotando la soga.",
    image: `${IMG}/Jump_Rope/0.jpg`,
    difficulty: "beginner",
  },
];

// Get all unique muscle groups
export const ALL_MUSCLE_GROUPS = [...new Set(EXERCISE_DATABASE.map((e) => e.muscleGroup))];

// Get all unique equipment types
export const ALL_EQUIPMENT = [...new Set(EXERCISE_DATABASE.map((e) => e.equipment))];

// Search/filter exercises
export function searchExercises(query: string, muscleGroup?: string, equipment?: string): ExerciseTemplate[] {
  let results = EXERCISE_DATABASE;

  if (muscleGroup) {
    results = results.filter((e) => e.muscleGroup === muscleGroup);
  }

  if (equipment) {
    results = results.filter((e) => e.equipment === equipment);
  }

  if (query) {
    const lower = query.toLowerCase();
    results = results.filter((e) =>
      e.name.toLowerCase().includes(lower) ||
      e.muscleGroup.toLowerCase().includes(lower) ||
      e.secondaryMuscles.some((m) => m.toLowerCase().includes(lower))
    );
  }

  return results;
}

// Get muscles targeted by a list of exercises
export function getMusclesCovered(exercises: Array<{ muscleGroup: string | null; secondaryMuscles?: string[] }>): Map<string, { primary: number; secondary: number }> {
  const coverage = new Map<string, { primary: number; secondary: number }>();

  for (const ex of exercises) {
    if (ex.muscleGroup) {
      const existing = coverage.get(ex.muscleGroup) ?? { primary: 0, secondary: 0 };
      existing.primary++;
      coverage.set(ex.muscleGroup, existing);
    }

    // Find secondary muscles from database
    if (ex.muscleGroup) {
      const dbExercise = EXERCISE_DATABASE.find((e) => e.muscleGroup === ex.muscleGroup);
      const secondaries = ex.secondaryMuscles ?? dbExercise?.secondaryMuscles ?? [];
      for (const muscle of secondaries) {
        const existing = coverage.get(muscle) ?? { primary: 0, secondary: 0 };
        existing.secondary++;
        coverage.set(muscle, existing);
      }
    }
  }

  return coverage;
}
