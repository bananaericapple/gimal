
import { GoogleGenAI, Type } from "@google/genai";
import { GameStats, AIAnalysis } from "../types";

export const getAIAnalysis = async (stats: GameStats, difficulty: string, grade: string): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const avgReactionTime = stats.reactionTimes.length > 0 
    ? (stats.reactionTimes.reduce((a, b) => a + b, 0) / stats.reactionTimes.length).toFixed(0)
    : "N/A";

  const prompt = `
    Analyze this aim training session and provide feedback.
    Difficulty: ${difficulty}
    Grade: ${grade}
    Hits: ${stats.hits}
    Misses: ${stats.misses}
    Accuracy: ${stats.accuracy.toFixed(1)}%
    Score: ${stats.score}
    Average Reaction Time: ${avgReactionTime}ms
    
    Provide constructive, professional feedback for an FPS player. 
    Acknowledge their grade (${grade}).
    Focus on whether they need to prioritize speed or accuracy.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A brief summary of performance" },
            tips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 actionable tips for improvement"
            },
            recommendedDrill: { type: Type.STRING, description: "A suggested training drill" }
          },
          required: ["summary", "tips", "recommendedDrill"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: `You achieved an ${grade} grade! Great job on completing the session.`,
      tips: ["Focus on center-mass of targets", "Maintain a consistent mouse grip", "Practice daily for muscle memory"],
      recommendedDrill: "Try the Hard difficulty to push your limits."
    };
  }
};
