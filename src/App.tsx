import React, { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  Flame, 
  Droplet, 
  Plus, 
  Trash2, 
  Sparkles, 
  Send, 
  RefreshCw, 
  User, 
  Heart, 
  Volume2, 
  Trophy, 
  Clock, 
  Dumbbell, 
  Moon, 
  Apple, 
  Compass,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  WorkoutLog, 
  DailyMetrics, 
  UserStats, 
  MotivationPayload, 
  ChatMessage 
} from "./types";

// Prefilled realistic health records & workouts so the app is instantly rich with activity
const INITIAL_WORKOUT_LOGS: WorkoutLog[] = [
  {
    id: "w-1",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    exerciseName: "Hypertrophy Push Session",
    category: "Strength",
    durationMinutes: 55,
    caloriesBurnedEstimate: 420,
    intensityLevel: 8,
    notes: "Heavy bench pressing & shoulder volume. Felt phenomenal today!"
  },
  {
    id: "w-2",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    exerciseName: "High Mobility Cardio Interval",
    category: "Cardio",
    durationMinutes: 30,
    caloriesBurnedEstimate: 310,
    intensityLevel: 7,
    notes: "Stretching and kettlebell conditioning intervals to keep the body fluid."
  }
];

const INITIAL_METRICS: DailyMetrics[] = [
  {
    date: new Date().toISOString().split('T')[0],
    waterIntakeLiters: 1.5,
    caloriesIntakeKcal: 1750,
    caloriesBurnedKcal: 310,
    sleepHours: 7.2,
    bodyWeightKg: 78.4
  }
];

const INITIAL_USER_STATS: UserStats = {
  name: "Champion",
  goal: "Build lean core strength & functional endurance",
  currentWeight: 78.4,
  waterGoal: 3.2,
  calorieGoal: 2300,
  motivationVoice: "Gym Bro"
};

const INITIAL_MOTIVATION: MotivationPayload = {
  quote: "Your body is an engineering marvel. It adapts, rebuilds, and conquers whatever burden you choose to place on it.",
  challenge: "Complete a 3-minute strict isometric forearm plank and 50 perfect squats.",
  tip: "Optimal pre-workout intake includes simple carbs and 350ml water exactly 45 minutes before stepping on the gym floor.",
  vibeLevel: "IRON WILLPOWER",
  energyScore: 85
};

export default function App() {
  // --- Persistent States ---
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem("gym_user_stats");
    return saved ? JSON.parse(saved) : INITIAL_USER_STATS;
  });

  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => {
    const saved = localStorage.getItem("gym_workout_logs");
    return saved ? JSON.parse(saved) : INITIAL_WORKOUT_LOGS;
  });

  const [dailyMetricsHistory, setDailyMetricsHistory] = useState<DailyMetrics[]>(() => {
    const saved = localStorage.getItem("gym_daily_metrics");
    return saved ? JSON.parse(saved) : INITIAL_METRICS;
  });

  const [motivation, setMotivation] = useState<MotivationPayload>(() => {
    const saved = localStorage.getItem("gym_motivation_payload");
    return saved ? JSON.parse(saved) : INITIAL_MOTIVATION;
  });

  const [streak, setStreak] = useState<number>(() => {
    const saved = localStorage.getItem("gym_streak");
    return saved ? parseInt(saved, 10) : 3; // start with a fun minor streak
  });

  // --- UI Interactivity States ---
  const [currentTab, setCurrentTab] = useState<"dashboard" | "workouts" | "coach" | "profile">("dashboard");
  const [voiceSelector, setVoiceSelector] = useState<"Gym Bro" | "Zen Shaman" | "Fierce Drill Sergeant" | "Supportive Trainer">(
    userStats.motivationVoice
  );
  
  // Custom inputs for workout logging
  const [inputWorkoutTitle, setInputWorkoutTitle] = useState("");
  const [inputCategory, setInputCategory] = useState<"Strength" | "Cardio" | "Flexibility" | "Core">("Strength");
  const [inputDuration, setInputDuration] = useState<number>(45);
  const [inputCalories, setInputCalories] = useState<number>(300);
  const [inputIntensity, setInputIntensity] = useState<number>(7);
  const [inputNotes, setInputNotes] = useState("");

  // Input metric helpers for logging today
  const [todayWeight, setTodayWeight] = useState<number>(userStats.currentWeight);
  const [addedCalories, setAddedCalories] = useState<string>("500");

  // Real-time digital clock state
  const [digitalTime, setDigitalTime] = useState("");

  // Chat agent states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("gym_chat_history");
    return saved ? JSON.parse(saved) : [
      {
        id: "sys-1",
        role: "assistant",
        text: "Step inside, Athlete. I am your fully custom AI Coach. Select your mentor personality block, and tell me if you are building iron muscles today or need recovery guidance!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [chatInput, setChatInput] = useState("");
  const [isGeneratingChat, setIsGeneratingChat] = useState(false);
  const [isGeneratingMotivation, setIsGeneratingMotivation] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Auto Scroll Ref
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Synchronize dynamic digital time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDigitalTime(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize items with Local Storage
  useEffect(() => {
    localStorage.setItem("gym_user_stats", JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem("gym_workout_logs", JSON.stringify(workoutLogs));
  }, [workoutLogs]);

  useEffect(() => {
    localStorage.setItem("gym_daily_metrics", JSON.stringify(dailyMetricsHistory));
  }, [dailyMetricsHistory]);

  useEffect(() => {
    localStorage.setItem("gym_motivation_payload", JSON.stringify(motivation));
  }, [motivation]);

  useEffect(() => {
    localStorage.setItem("gym_streak", streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("gym_chat_history", JSON.stringify(chatHistory));
    // scroll chat to bottom when updated
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Synchronize Voice change
  useEffect(() => {
    setUserStats(prev => ({ ...prev, motivationVoice: voiceSelector }));
  }, [voiceSelector]);

  // Retrieve today's metric block or create a fresh placeholder
  const getTodayMetric = (): DailyMetrics => {
    const todayStr = new Date().toISOString().split('T')[0];
    const existing = dailyMetricsHistory.find(m => m.date === todayStr);
    
    if (existing) return existing;
    
    // create fallback
    const fallback: DailyMetrics = {
      date: todayStr,
      waterIntakeLiters: 0,
      caloriesIntakeKcal: 0,
      caloriesBurnedKcal: 0,
      sleepHours: 7.0,
      bodyWeightKg: userStats.currentWeight
    };
    return fallback;
  };

  const updateTodayMetric = (updates: Partial<DailyMetrics>) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setDailyMetricsHistory(prev => {
      const idx = prev.findIndex(m => m.date === todayStr);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...updates };
        return copy;
      } else {
        const fresh: DailyMetrics = {
          date: todayStr,
          waterIntakeLiters: 0,
          caloriesIntakeKcal: 0,
          caloriesBurnedKcal: 0,
          sleepHours: 7.0,
          bodyWeightKg: userStats.currentWeight,
          ...updates
        };
        return [fresh, ...prev];
      }
    });
  };

  // --- API Handlers ---

  // Trigger Gemini-crafted Motivational Boost
  const triggerHypeRefreshByAI = async () => {
    setIsGeneratingMotivation(true);
    setErrorNotice(null);
    try {
      const response = await fetch("/api/motivation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: userStats.goal,
          workoutStreak: streak,
          motivationVoice: voiceSelector,
          recentActivities: workoutLogs.slice(0, 3)
        })
      });

      if (!response.ok) {
        throw new Error("Temporary network glitch on AI generator. Try again shortly!");
      }

      const freshResponse: MotivationPayload = await response.json();
      setMotivation(freshResponse);
    } catch (err: any) {
      console.error(err);
      setErrorNotice(err.message || "Failed to update custom AI motivation panel.");
    } finally {
      setIsGeneratingMotivation(false);
    }
  };

  // Chat message submit to Gemini AI Fitness Coach
  const submitChatToAICoach = async (customPrompt?: string) => {
    const messageToSend = customPrompt || chatInput;
    if (!messageToSend.trim() || isGeneratingChat) return;

    // Add User turn instantly
    const userMessage: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatInput("");
    setIsGeneratingChat(true);
    setErrorNotice(null);

    try {
      // Gather simplified history for backend payload context
      const previousTurns = chatHistory.slice(-8).map(m => ({
        role: m.role,
        text: m.text
      }));

      const todayMetrics = getTodayMetric();

      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageToSend,
          history: previousTurns,
          motivationVoice: voiceSelector,
          userStats: {
            ...userStats,
            workoutStreak: streak,
            workoutCount: workoutLogs.length,
            currentWeight: todayMetrics.bodyWeightKg,
            calorieBurnedToday: todayMetrics.caloriesBurnedKcal,
            calorieIntakeToday: todayMetrics.caloriesIntakeKcal,
            waterIntakeToday: todayMetrics.waterIntakeLiters
          }
        })
      });

      if (!response.ok) {
        throw new Error("The AI Coach is taking a breather. Please try submitting again!");
      }

      const data = await response.json();
      
      const coachReply: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        text: data.reply || "Let's work that muscle and burn the target!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, coachReply]);
    } catch (err: any) {
      console.error(err);
      setErrorNotice(err.message || "Failed to contact your fitness coach.");
    } finally {
      setIsGeneratingChat(false);
    }
  };

  // --- Client helpers ---

  const handleLoggedWorkoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputWorkoutTitle.trim()) return;

    const freshWorkout: WorkoutLog = {
      id: "w-" + Date.now(),
      date: new Date().toISOString().split('T')[0],
      exerciseName: inputWorkoutTitle,
      category: inputCategory,
      durationMinutes: inputDuration,
      caloriesBurnedEstimate: inputCalories,
      intensityLevel: inputIntensity,
      notes: inputNotes
    };

    // Append to list & increase streak
    setWorkoutLogs(prev => [freshWorkout, ...prev]);
    setStreak(prev => prev + 1);

    // Synchronize to calorie burn today
    const today = getTodayMetric();
    updateTodayMetric({
      caloriesBurnedKcal: today.caloriesBurnedKcal + inputCalories
    });

    // Reset inputs
    setInputWorkoutTitle("");
    setInputNotes("");
    
    // Jump user to positive feedback
    triggerHypeRefreshByAI();
  };

  const deleteWorkout = (id: string) => {
    setWorkoutLogs(prev => prev.filter(w => w.id !== id));
  };

  const progressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / (target || 1)) * 100), 100);
  };

  const today = getTodayMetric();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex overflow-hidden font-sans selection:bg-orange-500 selection:text-black">
      
      {/* 1. SIDEBAR (Elegant Dark theme) */}
      <aside className="hidden lg:flex w-[80px] border-r border-white/5 flex-col items-center py-8 gap-12 bg-[#0F0F0F] shrink-0 sticky top-0 h-screen justify-between">
        <div className="flex flex-col items-center gap-10 w-full animate-fade-in">
          {/* Logo / Badge */}
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shadow-lg shadow-orange-500/20 text-sm">
            FIT
          </div>

          {/* Icon Navigation */}
          <nav className="flex flex-col gap-8">
            <button 
              onClick={() => setCurrentTab("dashboard")} 
              title="Body Stats & Metrics"
              className={`p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                currentTab === "dashboard" 
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20 scale-110" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setCurrentTab("workouts")} 
              title="Exercise Logger"
              className={`p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                currentTab === "workouts" 
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20 scale-110" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Dumbbell className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setCurrentTab("coach")} 
              title="AI Chat Coach"
              className={`p-3 rounded-2xl transition-all duration-200 cursor-pointer relative ${
                currentTab === "coach" 
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20 scale-110" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#0F0F0F]" />
            </button>

            <button 
              onClick={() => setCurrentTab("profile")} 
              title="Athlete profile settings"
              className={`p-3 rounded-2xl transition-all duration-200 cursor-pointer ${
                currentTab === "profile" 
                  ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20 scale-110" 
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }`}
            >
              <User className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Sidebar Vertical text footer info */}
        <div className="mt-auto mb-4 opacity-20 text-[9px] uppercase tracking-[0.3em] font-mono [writing-mode:vertical-lr] rotate-180">
          FORGE v4.5.0
        </div>
      </aside>

      {/* 2. MAIN LAYOUT */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        
        {/* Mobile top-bar navigation */}
        <header className="lg:hidden border-b border-white/5 bg-[#0F0F0F]/90 backdrop-blur sticky top-0 z-50 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-black text-black text-xs">
              V
            </div>
            <span className="font-bold uppercase tracking-widest text-xs font-mono text-white/90">
              MOTIVATED HEALTH
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#151515] p-1.5 rounded-xl border border-white/5">
            <button 
              onClick={() => setCurrentTab("dashboard")} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${currentTab === "dashboard" ? "bg-orange-500 text-black" : "text-white/60"}`}
            >
              Metrics
            </button>
            <button 
              onClick={() => setCurrentTab("workouts")} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${currentTab === "workouts" ? "bg-orange-500 text-black" : "text-white/60"}`}
            >
              Log
            </button>
            <button 
              onClick={() => setCurrentTab("coach")} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${currentTab === "coach" ? "bg-orange-500 text-black" : "text-white/60"}`}
            >
              AI Chat
            </button>
            <button 
              onClick={() => setCurrentTab("profile")} 
              className={`p-1.5 rounded-lg transition ${currentTab === "profile" ? "bg-orange-500 text-black" : "text-white/60"}`}
            >
              <User className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* 3. HERO / FORGE YOURSELF GRAPHICS (Elegant Dark design pattern) */}
        <div className="p-6 md:p-12 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-4">
              <div className="uppercase tracking-[0.3em] text-[10px] md:text-xs text-orange-500 font-extrabold flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                {voiceSelector} MODE • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-2xl md:text-4xl font-light opacity-30 font-mono tracking-widest">
                {digitalTime || "08:14:02"}
              </div>
            </div>

            <h1 className="text-[55px] sm:text-[85px] md:text-[110px] lg:text-[140px] leading-[0.8] font-black italic uppercase tracking-tighter text-white/90">
              FORGE<br/>YOURSELF
            </h1>
            
            {/* Hype streak counter */}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <div className="px-3 py-1 bg-[#151515] hover:bg-[#1C1C1C] transition border border-white/5 rounded-full text-[11px] font-mono tracking-widest uppercase text-white/60">
                ⚡ {streak} DAY DISCIPLINE STREAK
              </div>
              <div className="px-3 py-1 bg-[#151515] border border-white/5 rounded-full text-[11px] font-mono tracking-widest uppercase text-orange-400">
                🏆 GOAL: {userStats.goal}
              </div>
              <div className="px-3 py-1 bg-[#151515] border border-[#f97316]/20 rounded-full text-[11px] font-mono tracking-widest uppercase text-white/80">
                🔊 PERSONA: {voiceSelector}
              </div>
            </div>
          </div>
        </div>

        {/* Subtitle status banner & API Warnings */}
        <section className="max-w-7xl mx-auto w-full px-6 md:px-12 mt-2">
          {errorNotice && (
            <div className="p-4 bg-red-950/40 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-red-300 font-bold uppercase tracking-wider font-mono">System Broadcast Code</p>
                <p className="text-xs text-red-400/90 mt-1">{errorNotice}</p>
              </div>
              <button className="text-white/40 hover:text-white ml-auto text-xs font-mono" onClick={() => setErrorNotice(null)}>✕</button>
            </div>
          )}
        </section>

        {/* 4. MAIN SCREEN CONTAINER */}
        <main className="max-w-7xl mx-auto w-full px-6 md:px-12 py-6 flex-1">
          
          {/* Dynamic AI Hype block */}
          <section className="mb-10 bg-[#151515] border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl transition hover:border-white/10">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-orange-500" />
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
              {/* Daily dynamic Quote generated via API */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-2 text-[10px] tracking-widest font-mono text-white/40 uppercase">
                  <span>CURATED ATTRIBUTES</span>
                  <span>•</span>
                  <span className="text-orange-500 font-bold">VIBE STATUS: {motivation.vibeLevel}</span>
                </div>

                <blockquote className="text-lg md:text-xl font-bold italic tracking-tight text-white/95 leading-relaxed">
                  "{motivation.quote}"
                </blockquote>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-white/10 transition">
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest font-mono block mb-1">TODAY'S WORKOUT CHALLENGE</span>
                    <p className="text-xs text-white/70 font-semibold leading-relaxed">{motivation.challenge}</p>
                  </div>
                  <div className="p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl hover:border-white/10 transition">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono block mb-1">NUTRITION & JOINT HYDRATION TIP</span>
                    <p className="text-xs text-white/70 font-semibold leading-relaxed">{motivation.tip}</p>
                  </div>
                </div>
              </div>

              {/* Energy Intensity dial block */}
              <div className="flex flex-col items-center justify-center p-5 bg-[#0A0A0A] border border-white/5 rounded-2xl text-center relative overflow-hidden group">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-mono mb-2">TARGET PERFORMANCE</span>
                
                <div className="relative flex items-center justify-center w-24 h-24 my-1">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="38" stroke="rgba(255,255,255,0.03)" strokeWidth="6" fill="transparent" />
                    <circle cx="48" cy="48" r="38" stroke="#f97316" strokeWidth="6" fill="transparent"
                      strokeDasharray="238"
                      strokeDashoffset={238 - (238 * (motivation.energyScore || 75)) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center mt-[-1px]">
                    <span className="text-2xl font-black text-white tracking-tighter">{motivation.energyScore || 75}</span>
                    <span className="text-[8px] text-white/30 font-mono tracking-widest uppercase">INTENSITY</span>
                  </div>
                </div>

                <button 
                  onClick={triggerHypeRefreshByAI}
                  disabled={isGeneratingMotivation}
                  className="mt-3 w-full py-2 bg-white text-black hover:bg-orange-500 hover:text-black transition duration-200 font-black text-[10px] uppercase tracking-widest rounded-full cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5 focus:outline-none"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingMotivation ? "animate-spin" : ""}`} />
                  {isGeneratingMotivation ? "HYPE LOAD..." : "AI INSPIRED HYPE"}
                </button>
              </div>
            </div>
          </section>

          {/* Desktop/tablet inner tabs menu to switch submodules */}
          <div className="hidden lg:flex border-b border-white/5 mb-8 justify-start gap-1">
            {[
              { id: "dashboard", label: "BODY HEALTH SNAPSHOTS", icon: Activity },
              { id: "workouts", label: "EXERCISE LOGGER & TEMPLATES", icon: Dumbbell },
              { id: "coach", label: "AI MENTORS CORNER CHAT", icon: Sparkles },
              { id: "profile", label: "ATHLETE TARGET SETTING", icon: User }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`px-6 py-4 font-bold text-xs tracking-widest uppercase rounded-t-2xl transition-all duration-150 flex items-center gap-2 border-b-2 cursor-pointer ${
                    isActive 
                      ? "border-orange-500 text-orange-500 bg-[#151515]" 
                      : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <AnimatePresence mode="wait">
            
            {/* SUB-VIEW 1: BODY HEALTH SNAPSHOTS (BENTO-GRID STYLE) */}
            {currentTab === "dashboard" && (
              <motion.div 
                key="dashboard-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* WATER CARD */}
                  <div className="bg-[#151515] p-6 border border-white/5 rounded-3xl flex flex-col justify-between hover:border-white/10 transition group relative overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="uppercase text-[9px] tracking-[0.2em] text-white/40 font-mono">WATER HYDRATION</span>
                        <Droplet className="w-4 h-4 text-cyan-400 fill-cyan-400/30" />
                      </div>
                      <div className="text-4xl font-extrabold text-white tracking-tight">
                        {today.waterIntakeLiters.toFixed(1)} <span className="text-sm font-normal text-white/40">/ {userStats.waterGoal.toFixed(1)} L</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {/* Water visual status bar */}
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-400 h-full transition-all duration-300"
                          style={{ width: `${progressPercentage(today.waterIntakeLiters, userStats.waterGoal)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] uppercase text-white/40 font-mono">
                        <span>{progressPercentage(today.waterIntakeLiters, userStats.waterGoal)}% of Day Limit</span>
                        <span>{today.waterIntakeLiters >= userStats.waterGoal ? "Optimal ✨" : "Need water"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button 
                          onClick={() => updateTodayMetric({ waterIntakeLiters: Math.max(0, today.waterIntakeLiters - 0.25) })}
                          className="py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold rounded-xl cursor-pointer active:scale-95 transition"
                        >
                          -250ML
                        </button>
                        <button 
                          onClick={() => updateTodayMetric({ waterIntakeLiters: today.waterIntakeLiters + 0.25 })}
                          className="py-2 bg-orange-500 text-black hover:bg-orange-600 font-extrabold text-xs rounded-xl cursor-pointer active:scale-95 transition"
                        >
                          +250ML
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE CALORIES FOOD INPUT CARD */}
                  <div className="bg-[#151515] p-6 border border-white/5 rounded-3xl flex flex-col justify-between hover:border-white/10 transition group relative overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="uppercase text-[9px] tracking-[0.2em] text-white/40 font-mono">ENERGY INTAKE</span>
                        <Apple className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="text-4xl font-extrabold text-white tracking-tight">
                        {today.caloriesIntakeKcal} <span className="text-sm font-normal text-white/40">/ {userStats.calorieGoal} KCAL</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {/* Calorie status bar */}
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-orange-500 h-full transition-all duration-300"
                          style={{ width: `${progressPercentage(today.caloriesIntakeKcal, userStats.calorieGoal)}%` }}
                        />
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-white/40 font-mono">
                        <span>BURN TODAY: <b>-{today.caloriesBurnedKcal} KCAL</b></span>
                        <span>NET: {today.caloriesIntakeKcal - today.caloriesBurnedKcal}</span>
                      </div>

                      {/* Log calorie fast input */}
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          value={addedCalories}
                          onChange={(e) => setAddedCalories(e.target.value)}
                          placeholder="kcal"
                          className="w-full px-3 py-1.5 bg-[#0A0A0A] border border-white/5 text-xs text-white uppercase outline-none rounded-xl focus:border-orange-500 font-mono"
                        />
                        <button 
                          onClick={() => {
                            const val = parseInt(addedCalories, 10);
                            if (!isNaN(val)) {
                              updateTodayMetric({ caloriesIntakeKcal: today.caloriesIntakeKcal + val });
                            }
                          }}
                          className="px-4 bg-white text-black font-extrabold uppercase text-[10px] tracking-wider rounded-xl cursor-pointer transition hover:bg-orange-500 active:scale-95"
                        >
                          ADD
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* RESTORATIVE SLEEP HEALTH */}
                  <div className="bg-[#151515] p-6 border border-white/5 rounded-3xl flex flex-col justify-between hover:border-white/10 transition group relative overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="uppercase text-[9px] tracking-[0.2em] text-white/40 font-mono">RECOVERY INDEX</span>
                        <Moon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="text-4xl font-extrabold text-white tracking-tight">
                        {today.sleepHours.toFixed(1)} <span className="text-sm font-normal text-white/40">HRS</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="text-[10px] font-medium leading-relaxed">
                        {today.sleepHours >= 8 ? (
                          <span className="text-emerald-400">✨ Premium cell protein recovery window synced!</span>
                        ) : today.sleepHours >= 7 ? (
                          <span className="text-white/70">👍 Good nervous system repair window.</span>
                        ) : (
                          <span className="text-orange-400">⚠️ Low sleep. Avoid extreme compound overload today.</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-white/40 font-mono">
                          <span>REST SPEED LIMIT:</span>
                          <span>{today.sleepHours} hrs</span>
                        </div>
                        <input 
                          type="range"
                          min="4"
                          max="12"
                          step="0.5"
                          value={today.sleepHours}
                          onChange={(e) => updateTodayMetric({ sleepHours: parseFloat(e.target.value) })}
                          className="w-full accent-orange-500 h-1 bg-white/5 rounded-full cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BODY WEIGHT AND MASS CARD */}
                  <div className="bg-[#151515] p-6 border border-white/5 rounded-3xl flex flex-col justify-between hover:border-white/10 transition group relative overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="uppercase text-[9px] tracking-[0.2em] text-white/40 font-mono">ATHLETE BODY MASS</span>
                        <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                      </div>
                      <div className="text-4xl font-extrabold text-white tracking-tight">
                        {today.bodyWeightKg.toFixed(1)} <span className="text-sm font-normal text-white/40">KG</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <p className="text-[10px] text-white/40 leading-normal">
                        Tracking daily weight confirms body water retention & muscle gains.
                      </p>

                      <div className="flex gap-2">
                        <input 
                          type="number"
                          step="0.1"
                          value={todayWeight}
                          onChange={(e) => setTodayWeight(parseFloat(e.target.value) || 0)}
                          placeholder="kg"
                          className="w-full px-3 py-1.5 bg-[#0A0A0A] border border-white/5 text-xs text-white uppercase outline-none rounded-xl focus:border-orange-500 font-mono"
                        />
                        <button 
                          onClick={() => {
                            if (todayWeight > 0) {
                              updateTodayMetric({ bodyWeightKg: todayWeight });
                              setUserStats(prev => ({ ...prev, currentWeight: todayWeight }));
                            }
                          }}
                          className="px-4 bg-white text-black font-extrabold uppercase text-[10px] tracking-wider rounded-xl cursor-pointer transition hover:bg-orange-500 active:scale-95"
                        >
                          SET
                        </button>
                      </div>
                    </div>
                  </div>

                </div>

                {/* CONSISTENCY LOG SNAPSHOT TABLE */}
                <div className="bg-[#151515] border border-white/5 rounded-3xl p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono">Consolidated Metric Snapshots</h3>
                      <p className="text-xs text-white/40 mt-1">Private secure health tracking logs stored locally inside this sandbox session.</p>
                    </div>

                    <button 
                      onClick={() => {
                        if (window.confirm("Flush database tracking archives to start fresh?")) {
                          setDailyMetricsHistory(INITIAL_METRICS);
                          setWorkoutLogs(INITIAL_WORKOUT_LOGS);
                          setStreak(0);
                          triggerHypeRefreshByAI();
                        }
                      }}
                      className="text-[10px] font-bold text-white/40 hover:text-orange-500 uppercase tracking-widest font-mono px-4 py-2 bg-[#0A0A0A] border border-white/5 rounded-xl transition cursor-pointer"
                    >
                      FLUSH LOG ARCHIVES
                    </button>
                  </div>

                  <div className="overflow-x-auto scrollbar-none">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 text-white/40 font-mono uppercase tracking-wider">
                          <th className="py-4 px-4 font-bold">Metric Snap Date</th>
                          <th className="py-4 px-4 font-bold">Liters Drunk</th>
                          <th className="py-4 px-4 font-bold">Calorie Food intake</th>
                          <th className="py-4 px-4 font-bold">Sleep Rest</th>
                          <th className="py-4 px-4 font-bold">Body Mass</th>
                          <th className="py-4 px-4 font-bold text-right">Burn Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dailyMetricsHistory.map((metric, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition">
                            <td className="py-4 px-4 font-medium text-white font-mono">{metric.date}</td>
                            <td className="py-4 px-4 font-mono text-white/80">{metric.waterIntakeLiters.toFixed(2)} L</td>
                            <td className="py-4 px-4 font-mono text-white/80">{metric.caloriesIntakeKcal} kcal</td>
                            <td className="py-4 px-4 font-mono text-white/80">{metric.sleepHours} hrs</td>
                            <td className="py-4 px-4 font-mono text-white/80">{metric.bodyWeightKg} kg</td>
                            <td className="py-4 px-4 text-right">
                              <span className="px-2.5 py-1 rounded bg-orange-500/10 text-orange-500 border border-orange-500/10 font-bold font-mono">
                                -{metric.caloriesBurnedKcal || 0} kcal
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB-VIEW 2: WORKOUT LOGGER & PRESETS */}
            {currentTab === "workouts" && (
              <motion.div 
                key="workouts-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="grid grid-cols-1 lg:grid-cols-5 gap-8"
              >
                
                {/* Logging Form */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#151515] border border-white/5 rounded-3xl p-6 shadow-xl relative">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 font-mono">
                      <Plus className="w-4 h-4 text-orange-500" /> Daily Activity Logger
                    </h3>

                    <form onSubmit={handleLoggedWorkoutSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">Session / Exercise Name</label>
                        <input 
                          required
                          type="text"
                          value={inputWorkoutTitle}
                          onChange={(e) => setInputWorkoutTitle(e.target.value)}
                          placeholder="e.g. Weighted Pull-ups & Deadlifts"
                          className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/5 outline-none rounded-xl text-white focus:border-orange-500 text-xs font-semibold uppercase tracking-wider"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">Type Category</label>
                          <select 
                            value={inputCategory}
                            onChange={(e) => setInputCategory(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/5 outline-none rounded-xl text-white focus:border-orange-500 text-xs font-semibold uppercase font-mono"
                          >
                            <option value="Strength" className="bg-[#0A0A0A]">Strength</option>
                            <option value="Cardio" className="bg-[#0A0A0A]">Cardio (HIIT)</option>
                            <option value="Flexibility" className="bg-[#0A0A0A]">Elasticity</option>
                            <option value="Core" className="bg-[#0A0A0A]">Core / Abs</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">Duration (minutes)</label>
                          <input 
                            type="number"
                            min="5"
                            max="240"
                            value={inputDuration}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 5;
                              setInputDuration(val);
                              const multiplier = inputCategory === "Cardio" ? 10 : inputCategory === "Strength" ? 7.5 : 4;
                              setInputCalories(Math.round(val * multiplier));
                            }}
                            className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/5 outline-none rounded-xl text-white focus:border-orange-500 text-xs font-semibold font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">Intensity scale (1-10)</label>
                          <div className="flex items-center gap-2">
                            <input 
                              type="range"
                              min="1"
                              max="10"
                              value={inputIntensity}
                              onChange={(e) => setInputIntensity(parseInt(e.target.value, 10))}
                              className="w-full accent-orange-500 h-1 bg-white/5 rounded-full cursor-pointer animate-pulse"
                            />
                            <span className="text-xs font-bold text-orange-500 font-mono w-4">{inputIntensity}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">Kcal Exertion</label>
                          <input 
                            type="number"
                            value={inputCalories}
                            onChange={(e) => setInputCalories(parseInt(e.target.value, 10) || 0)}
                            className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/5 outline-none rounded-xl text-white focus:border-orange-500 text-xs font-semibold font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">Execution Log Notes</label>
                        <textarea 
                          value={inputNotes}
                          onChange={(e) => setInputNotes(e.target.value)}
                          placeholder="Sets, weights, and reps accomplished."
                          rows={2}
                          className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/5 outline-none text-xs rounded-xl text-white focus:border-orange-500 font-medium"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-3 bg-white hover:bg-orange-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition duration-150 active:scale-95 cursor-pointer focus:outline-none"
                      >
                        SUBMIT ACTIVITY LOG
                      </button>
                    </form>
                  </div>

                  {/* Prebuilt Templates Quick selectors */}
                  <div className="bg-[#151515] border border-white/5 rounded-3xl p-5">
                    <h4 className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-3 font-mono">Quick load athletic templates</h4>
                    <div className="space-y-2">
                      {[
                        { title: "Iron Chest & Tricep Builder", cat: "Strength", mins: 45, burn: 340, notes: "3 bench sets, 3 incline dumbbell sets, 3 dips." },
                        { title: "Peak HIIT Tabata Cardio", cat: "Cardio", mins: 20, burn: 220, notes: "20s explosive sprint, 10s walk. 8 total sets." },
                        { title: "Posterior Chain Mobility Focus", cat: "Flexibility", mins: 15, burn: 60, notes: "Hamstring and spine flow to release training fatigue." },
                        { title: "High-Compression Ab Burner", cat: "Core", mins: 15, burn: 110, notes: "Leg raises, strict sit-ups, side planks." }
                      ].map((tpl, idx) => (
                        <button 
                          key={idx}
                          onClick={() => {
                            setInputWorkoutTitle(tpl.title);
                            setInputCategory(tpl.cat as any);
                            setInputDuration(tpl.mins);
                            setInputCalories(tpl.burn);
                            setInputNotes(tpl.notes);
                          }}
                          className="w-full text-left p-3.5 bg-[#0A0A0A]/40 hover:bg-[#0A0A0A] border border-white/5 hover:border-white/10 rounded-xl transition flex items-center justify-between group cursor-pointer text-xs"
                        >
                          <div>
                            <p className="font-extrabold text-white/90 group-hover:text-orange-500 transition tracking-wider uppercase text-[11px]">{tpl.title}</p>
                            <p className="text-[9px] text-white/40 mt-0.5 font-mono">{tpl.cat} • {tpl.mins} mins • {tpl.burn} Kcal</p>
                          </div>
                          <Plus className="w-4 h-4 text-white/30 group-hover:text-orange-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workout list history log list */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="bg-[#151515] border border-white/5 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-widest font-mono">Recorded Workouts Logbook</h3>
                        <p className="text-xs text-white/40 mt-1">Consistency metrics stored inside this browser instance.</p>
                      </div>
                      <span className="text-[10px] font-mono px-3 py-1 bg-[#0A0A0A] text-orange-500 border border-white/5 rounded-lg font-bold">
                        {workoutLogs.length} DRILLS REGISTERED
                      </span>
                    </div>

                    <AnimatePresence>
                      {workoutLogs.length === 0 ? (
                        <div className="text-center py-12 text-white/30 border border-dashed border-white/5 rounded-2xl">
                          <Dumbbell className="w-10 h-10 mx-auto text-white/10 mb-3" />
                          <p className="text-xs font-mono uppercase tracking-widest">No activities logged for today.</p>
                          <p className="text-[11px] text-white/30 mt-1">Load templates or execute logs above.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {workoutLogs.map((log) => (
                            <motion.div 
                              key={log.id}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="p-5 bg-[#0A0A0A] border border-white/5 rounded-2xl flex flex-col md:flex-row justify-between gap-4 group hover:border-white/10 transition duration-150"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-[8px] uppercase font-mono font-black tracking-widest rounded ${
                                    log.category === "Strength" 
                                      ? "bg-red-500/10 text-red-500 border border-red-500/10"
                                      : log.category === "Cardio"
                                      ? "bg-orange-500/10 text-orange-500 border border-orange-500/10"
                                      : log.category === "Core"
                                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10"
                                      : "bg-indigo-500/10 text-indigo-500 border border-indigo-500/10"
                                  }`}>
                                    {log.category}
                                  </span>
                                  <span className="text-[9px] text-white/40 font-mono tracking-wider">{log.date}</span>
                                </div>

                                <h4 className="text-sm font-black text-white group-hover:text-orange-500 transition tracking-wider uppercase">
                                  {log.exerciseName}
                                </h4>

                                {log.notes && (
                                  <p className="text-xs text-white/60 leading-relaxed font-medium">
                                    {log.notes}
                                  </p>
                                )}

                                <div className="flex items-center gap-4 text-[10px] text-white/40 font-mono uppercase">
                                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {log.durationMinutes} MINUTE EFFORT</span>
                                  <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> -{log.caloriesBurnedEstimate} KCAL</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between md:flex-col md:justify-center md:items-end gap-3 border-t border-white/5 md:border-transparent pt-3 md:pt-0 shrink-0">
                                <div className="text-right">
                                  <span className="text-[8px] text-white/30 uppercase tracking-widest font-mono">TRAINING LOAD</span>
                                  <div className="text-sm font-black text-orange-500 font-mono">{log.intensityLevel} / 10</div>
                                </div>

                                <button 
                                  onClick={() => deleteWorkout(log.id)}
                                  className="text-white/20 hover:text-red-500 p-2 hover:bg-white/5 rounded-xl transition active:scale-95 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>

              </motion.div>
            )}

            {/* SUB-VIEW 3: AI FIT COACH'S CORNER CHAT */}
            {currentTab === "coach" && (
              <motion.div 
                key="coach-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-[#151515] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[600px] relative"
              >
                
                {/* Mentor selector options panel on Left */}
                <div className="w-full md:w-64 border-r border-white/5 p-5 shrink-0 bg-[#0F0F0F] space-y-4">
                  <div>
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest font-mono">MENTOR PERSONA BLOCKS</h3>
                    <p className="text-[9px] text-white/30 mt-1">Swap voice channels instantly to configure feedback behaviors.</p>
                  </div>

                  <div className="space-y-2">
                    {[
                      { id: "Gym Bro", label: "Gym Bro", desc: "Pure high tempo hype! Heavy lifting, gym jokes, and protein weight gain.", icon: Flame, color: "text-orange-500 bg-orange-500/10 border-orange-500/10" },
                      { id: "Zen Shaman", label: "Mindful Zen Shaman", desc: "Deeper perspective. Muscle stretch, recovery pathways, breathing balance.", icon: Compass, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/10" },
                      { id: "Fierce Drill Sergeant", label: "Fierce Sergeant", desc: "Zero compromises. Break limits, bypass excuses, execute sets perfectly.", icon: Trophy, color: "text-red-500 bg-red-500/10 border-red-500/10" },
                      { id: "Supportive Trainer", label: "Elite Support Coach", desc: "Scientific macros calculation, perfect forms, warm guidance blocks.", icon: Heart, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/10" }
                    ].map((coach) => {
                      const CoachIcon = coach.icon;
                      const isActive = voiceSelector === coach.id;
                      return (
                        <button 
                          key={coach.id}
                          onClick={() => {
                            setVoiceSelector(coach.id as any);
                            setChatHistory(prev => [
                              ...prev, 
                              { 
                                id: "sys-" + Date.now(), 
                                role: "assistant", 
                                text: `Transmission tuned successfully to **${coach.id}** status lines. Let's optimize our athletic capabilities! Submit queries.`,
                                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                            ]);
                          }}
                          className={`w-full text-left p-3 rounded-2xl border transition text-xs flex items-start gap-2.5 cursor-pointer ${
                            isActive 
                              ? "bg-[#0A0A0A] border-orange-500/50 text-white font-extrabold shadow-lg" 
                              : "bg-[#0A0A0A]/30 border-white/5 hover:bg-[#0A0A0A]/80 text-white/50"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${coach.color} shrink-0`}>
                            <CoachIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`font-black uppercase tracking-wider text-[10px] ${isActive ? "text-orange-500" : "text-white/60"}`}>{coach.id}</p>
                            <p className="text-[9px] text-white/40 leading-snug mt-0.5">{coach.desc}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <div className="p-3 bg-[#0A0A0A]/40 border border-white/5 rounded-xl">
                    <p className="text-[9px] text-white/30 font-mono tracking-normal leading-normal">
                      ⚠️ AI Coach metrics context: Username ({userStats.name}), Mass ({userStats.currentWeight}kg), Daily Streak ({streak}), Target ({userStats.calorieGoal} kcal).
                    </p>
                  </div>
                </div>

                {/* Chat feed container */}
                <div className="flex-1 flex flex-col h-full bg-[#121212]/30">
                  
                  {/* Status header */}
                  <div className="px-5 py-3 border-b border-white/5 bg-[#0F0F0F] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest font-mono">STATUS TRANSMITTING • COACH: {voiceSelector}</span>
                    </div>
                    <span className="text-[8px] uppercase font-bold text-white/30 tracking-widest font-mono">SECURE INTERACTION ROUTE</span>
                  </div>

                  {/* Message stack scroll area */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 font-normal text-xs">
                    {chatHistory.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-xl rounded-2xl p-4 shadow-sm border leading-relaxed ${
                          msg.role === "user"
                            ? "bg-white text-black border-white font-bold"
                            : "bg-[#0A0A0A] text-white/90 border-white/5"
                        }`}>
                          <p className="whitespace-pre-line text-xs font-semibold">{msg.text}</p>
                          
                          <div className="mt-1 flex justify-end">
                            <span className={`text-[8px] font-mono ${msg.role === "user" ? "text-black/50" : "text-white/30"}`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* AI Coach typing thinking stance indicator */}
                    {isGeneratingChat && (
                      <div className="flex justify-start">
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 text-[11px] text-white/40 flex items-center gap-2">
                          <span className="flex gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </span>
                          <span>Coach {voiceSelector} is calculating physical variables and formulating code response...</span>
                        </div>
                      </div>
                    )}

                    <div ref={chatBottomRef} />
                  </div>

                  {/* Suggestion Chips */}
                  <div className="px-5 py-2.5 flex gap-2 overflow-x-auto scrollbar-none shrink-0 bg-[#0F0F0F]/80 border-t border-white/5">
                    {[
                      "Recommend a quick 10-min strict warm-up!",
                      "Draft structured high-protein grocery item checklists",
                      "How do I prevent lower back strain with deep squats?",
                      "Willpower is slipping! Command me to train hard!"
                    ].map((chip, i) => (
                      <button 
                        key={i}
                        onClick={() => submitChatToAICoach(chip)}
                        className="px-3 py-1.5 bg-[#0A0A0A] hover:bg-orange-500 hover:text-black border border-white/5 rounded-full transition text-[9px] text-white/50 tracking-wider font-extrabold uppercase shrink-0 cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Message Input form bar */}
                  <div className="p-4 bg-[#0F0F0F] border-t border-white/5 flex gap-3 shrink-0">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          submitChatToAICoach();
                        }
                      }}
                      placeholder={`Draft query to coach ${voiceSelector}...`}
                      className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-white/5 outline-none text-xs rounded-xl text-white focus:border-orange-500 uppercase tracking-wider font-semibold placeholder:text-white/20"
                    />
                    <button 
                      onClick={() => submitChatToAICoach()}
                      disabled={!chatInput.trim() || isGeneratingChat}
                      className="px-6 bg-white text-black hover:bg-orange-500 transition font-black text-xs uppercase tracking-widest rounded-xl cursor-pointer active:scale-95 disabled:opacity-40"
                    >
                      SEND
                    </button>
                  </div>

                </div>

              </motion.div>
            )}

            {/* SUB-VIEW 4: ATHLETE DEEP SETTINGS */}
            {currentTab === "profile" && (
              <motion.div 
                key="profile-view"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="max-w-2xl mx-auto bg-[#151515] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
              >
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest font-mono flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" /> ATHLETE PROFILE CONFIGURATION
                  </h3>
                  <p className="text-xs text-white/40 mt-1">Update your target profiles so that the machine learning models provide optimized physical motivation.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">Athlete Username</label>
                      <input 
                        type="text"
                        value={userStats.name}
                        onChange={(e) => setUserStats(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/5 outline-none rounded-xl text-white focus:border-orange-500 text-xs font-semibold uppercase tracking-wider font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">Base Weight Status (kg)</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={userStats.currentWeight}
                        onChange={(e) => setUserStats(prev => ({ ...prev, currentWeight: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/5 outline-none rounded-xl text-white focus:border-orange-500 text-xs font-semibold font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">My Prime Athletic Target Goal</label>
                    <input 
                      type="text"
                      value={userStats.goal}
                      onChange={(e) => setUserStats(prev => ({ ...prev, goal: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/5 outline-none rounded-xl text-white focus:border-orange-500 text-xs font-semibold uppercase tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">Calorie Target Target (kcal)</label>
                      <input 
                        type="number"
                        value={userStats.calorieGoal}
                        onChange={(e) => setUserStats(prev => ({ ...prev, calorieGoal: parseInt(e.target.value, 10) || 0 }))}
                        className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/5 outline-none rounded-xl text-white focus:border-orange-500 text-xs font-semibold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-extrabold text-white/40 uppercase tracking-widest mb-1.5 font-mono">Hydration target status (liters)</label>
                      <input 
                        type="number"
                        step="0.1"
                        value={userStats.waterGoal}
                        onChange={(e) => setUserStats(prev => ({ ...prev, waterGoal: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3.5 py-2.5 bg-[#0A0A0A] border border-white/5 outline-none rounded-xl text-white focus:border-orange-500 text-xs font-semibold font-mono"
                      />
                    </div>
                  </div>

                  {/* Manual streak tweak controls */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-white">Manual Streak Count</p>
                        <p className="text-[9px] text-white/40">Adjust streak registers without logging exercises.</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => setStreak(prev => Math.max(0, prev - 1))}
                        className="px-3 py-1 bg-[#0A0A0A] hover:bg-white hover:text-black hover:border-white transition border border-white/5 font-extrabold font-mono text-xs text-white rounded-lg cursor-pointer"
                      >
                        -1
                      </button>
                      <span className="text-xs font-black text-orange-500 font-mono px-3">{streak} DAYS</span>
                      <button 
                        type="button"
                        onClick={() => setStreak(prev => prev + 1)}
                        className="px-3 py-1 bg-[#0A0A0A] hover:bg-white hover:text-black hover:border-white transition border border-white/5 font-extrabold font-mono text-xs text-white rounded-lg cursor-pointer"
                      >
                        +1
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="button"
                      onClick={async () => {
                        await triggerHypeRefreshByAI();
                        alert("Settings synchronized successfully & motivation reloaded of new targets.");
                      }}
                      className="w-full py-3 bg-white hover:bg-orange-500 text-black font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer focus:outline-none"
                    >
                      SYNC ATHLETE ATTRIBUTES & BACKEND RE-PREP
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </main>

        {/* 5. ELEGANT SECURE BOTTOM BAR FOOTER */}
        <footer className="mt-20 border-t border-white/5 bg-[#0F0F0F] py-10 text-xs text-white/40 font-mono">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-1 text-center md:text-left">
              <p className="font-extrabold uppercase tracking-[0.2em] text-white/70">FORGED PERFORMANCE SYSTEM</p>
              <p className="text-[10px] leading-relaxed max-w-lg">
                Personalized micro metrics telemetry is cached exclusively on device inside immediate LocalStorage blocks. 
                Underlying smart prompts and chat interactions query server-side gemini-3.5 models safely.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="flex flex-col text-right">
                <span className="text-[9px] uppercase tracking-widest text-[#f97316]">NEXT LOG SCHEDULE</span>
                <span className="text-white">Active Workout - Late 18:00</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
