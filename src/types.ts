export interface WorkoutSet {
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseEntry {
  id: string;
  name: string;
  category: "Strength" | "Cardio" | "Flexibility" | "Core";
  sets: WorkoutSet[];
}

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  exerciseName: string; // quick workouts
  category: "Strength" | "Cardio" | "Flexibility" | "Core";
  durationMinutes: number;
  caloriesBurnedEstimate: number;
  intensityLevel: number; // 1 to 10
  notes?: string;
}

export interface DailyMetrics {
  date: string; // YYYY-MM-DD
  waterIntakeLiters: number;
  caloriesIntakeKcal: number;
  caloriesBurnedKcal: number;
  sleepHours: number;
  bodyWeightKg: number;
}

export interface UserStats {
  name: string;
  goal: string;
  currentWeight: number;
  waterGoal: number; // in liters
  calorieGoal: number; // in kcal target
  motivationVoice: "Gym Bro" | "Zen Shaman" | "Fierce Drill Sergeant" | "Supportive Trainer";
}

export interface MotivationPayload {
  quote: string;
  challenge: string;
  tip: string;
  vibeLevel: string;
  energyScore: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}
