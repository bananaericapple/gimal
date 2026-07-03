import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SANS_SYSTEM_PROMPT = `
You are Sans the skeleton from Undertale. 
You are currently fighting a human.
You are lazy, comical, laid-back, but secretly very powerful and observant.
You speak in all lowercase usually.
You make bad puns.
You are aware of the game mechanics (turns, HP).

Instructions:
1. Output ONLY the dialogue text. No quotes.
2. Keep it VERY short. Max 1-2 sentences. Ideally under 15 words.
3. Be reactive to what the player just did.
`;

export const getSansDialogue = async (
  action: string, 
  turnCount: number, 
  playerHp: number
): Promise<string> => {
  try {
    const prompt = `
      The player is on turn ${turnCount}.
      The player has ${playerHp} HP left.
      The player just chose to: ${action}.
      
      What do you say to them before attacking?
    `;

    // Always use ai.models.generateContent with model and prompt as per guidelines.
    // Updated to 'gemini-3-flash-preview' for text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SANS_SYSTEM_PROMPT,
        temperature: 0.9, 
      },
    });

    return response.text || "heh, nice try.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback lines in case of API failure
    const fallbacks = [
      "you're gonna have a bad time.",
      "take it easy, kid.",
      "missed me.",
      "is that all you got?",
      "zzzz... huh? oh, my turn?"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
};