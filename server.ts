import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON request body parser
  app.use(express.json());

  // Lazy initialize GoogleGenAI client to avoid crash if variable is not configured initially
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables. Set this secret in settings.");
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // 1. MOTIVATION ENDPOINT: Generates custom motivational payloads
  app.post("/api/motivation", async (req, res) => {
    try {
      const { goal, workoutStreak, motivationVoice = "Gym Bro", recentActivities = [] } = req.body;

      const ai = getGeminiClient();

      // Formulate a thorough prompt explaining user context
      const prompt = `Generate a daily fitness motivation payload for a user.
User Profile:
- Current Target Goal: ${goal || "General Strength & Lean Muscle"}
- Current Daily Streak: ${workoutStreak || 0} days
- Recent log entries: ${JSON.stringify(recentActivities)}
- Motivational Persona Voice Request: ${motivationVoice}

Persona Guidelines:
- "Gym Bro": Use enthusiastic terms like 'Let's go!', 'Slam that iron!', 'Gainz', high-tempo, heavy focus on pure effort.
- "Zen Shaman": Deep, reflective, mindful, focus on breath, slow progress, listening to the muscle and flow of life force.
- "Fierce Drill Sergeant": Military tone, highly disciplinary, bold, challenges excuses, no-nonsense grit.
- "Supportive Trainer": Educational, very warm, tactical, highly encouraging, friendly but firm.

Return a highly customized and realistic workout quote, daily actionable mini-challenge, wellness tip, a creative vibe title suitable for today, and an intensity level recommendation (scale 1-100) based on their streak and current activity levels. Ensure the quote and challenge match the requested Persona Voice exactly.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quote: { 
                type: Type.STRING, 
                description: "A highly specialized, energetic fitness quote that perfectly reflects the requested persona voice." 
              },
              challenge: { 
                type: Type.STRING, 
                description: "A fun and specific daily fitness challenge (e.g., '100 jumping jacks during breaks' or 'add 5 lbs to your main lift')." 
              },
              tip: { 
                type: Type.STRING, 
                description: "A recovery, nutritional, or technical tips that match the daily goal." 
              },
              vibeLevel: { 
                type: Type.STRING, 
                description: "A creative hype-level title (e.g. 'IRON WARRIOR', 'BREATH OF REGENERATION')." 
              },
              energyScore: { 
                type: Type.INTEGER, 
                description: "Recommendable target intensity score between 10 and 100." 
              }
            },
            required: ["quote", "challenge", "tip", "vibeLevel", "energyScore"]
          }
        }
      });

      const responseText = response.text || "{}";
      const data = JSON.parse(responseText.trim());
      res.json(data);
    } catch (error: any) {
      console.error("Error generating motivation:", error);
      res.status(500).json({ 
        error: "Failed to generate AI motivation.", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // 2. COACH CHAT ENDPOINT: Handles chat history and system trainer simulation
  app.post("/api/coach/chat", async (req, res) => {
    try {
      const { message, history = [], userStats = {}, motivationVoice = "Gym Bro" } = req.body;

      if (!message) {
        return res.status(400).json({ error: "No message was provided." });
      }

      const ai = getGeminiClient();

      // Configure system instruction based on selected voice persona
      let coachBehavior = "";
      if (motivationVoice === "Gym Bro") {
        coachBehavior = "You are a hyped-up, high-energy 'Gym Bro' AI coach. Use positive modern gym slang ('slaying', 'iron', 'gainz', 'beast mode', 'absolutely crushed it'). Keep it ultra-energetic, positive, brief, and incredibly motivational. Recommend classic lifts, high protein, and staying absolutely hydrated.";
      } else if (motivationVoice === "Zen Shaman") {
        coachBehavior = "You are a mindful 'Zen Shaman' wellness coach. Focus on mind-muscle connection, rhythmic breathing, sleep quality, restorative stretching, joint longevity, and clean holistic nutrition. Use calming, deep, and mindful words, but stay highly encouraging of physical mastery.";
      } else if (motivationVoice === "Fierce Drill Sergeant") {
        coachBehavior = "You are a passionate 'Fierce Drill Sergeant' AI coach. You speak in a commanding, intense, powerful military fitness trainer style. Call out procrastination, challenge the user to throw away easy excuses, urge them to complete their tasks with zero compromises. Use high strength metaphors, but keep it secure and motivational.";
      } else {
        coachBehavior = "You are a highly supportive, elite professional personal trainer. Give science-based, tactical, exceptionally warm and structured coaching on sets, reps, active restoration, and balanced macro nutrients. Be professional, deeply warm, and friendly.";
      }

      const systemInstruction = `${coachBehavior}
The user's current metrics are:
- Goal: ${userStats.goal || "General Health"}
- Streak: ${userStats.workoutStreak || 0} days
- Registered Workouts: ${userStats.workoutCount || 0}
- Current Weight: ${userStats.currentWeight || "unspecified"} kg
- Water Goal: ${userStats.waterGoal || "3"} L daily
- Calorie Intake Target: ${userStats.calorieGoal || "2000"} kcal

Reply to the user's chat message in a brief, direct, and actionable manner. Keep responses styled with elegant Markdown. Do not answer questions outside of health, gym, exercises, diet, sleep, and fitness motivation. If the user drifts off-topic, politely pivot back to training and crushing goals.`;

      // Translate history items representing user/assistant interactions to candidate turns for GoogleGenAI
      // Gemini expects format: { role: 'user' | 'model', parts: [{ text: string }] }
      const formattedContents = history.map((item: any) => {
        return {
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }]
        };
      });

      // Append latest turn
      formattedContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.85
        }
      });

      const replyText = response.text || "I'm with you all the way! Let's conquer today's target!";
      res.json({ reply: replyText });
    } catch (error: any) {
      console.error("Error in coach chat:", error);
      res.status(500).json({ 
        error: "Failed to generate AI advice.", 
        details: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Mount Vite middleware in development or static assets in production
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite middleware for development...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving production static files from /dist...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server bootstrap failure:", err);
});
