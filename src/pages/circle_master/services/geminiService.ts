import { GoogleGenAI, Type } from "@google/genai";
import { CircleResult } from '../types';

export const getGeminiFeedback = async (result: CircleResult): Promise<{ comment: string, tips: string[] }> => {
  if (!process.env.API_KEY) {
    return {
        comment: "API Key missing. Can't generate AI roast.",
        tips: ["Add your API Key to see what the AI thinks."]
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    The user just drew a circle with their mouse.
    Here are the stats:
    - Score: ${result.score.toFixed(1)}/100
    - Grade: ${result.grade}
    - Average Radius: ${Math.round(result.radius)}px
    - Deviation Error: ${(result.deviation).toFixed(2)}
    - Gap between start and end: ${Math.round(result.closureGap)}px
    - Is Closed Circle: ${result.isClosed}

    Provide a short, witty, and slightly sarcastic (if the score is low) or praising (if high) comment about their drawing skills.
    Also provide 2 brief technical tips on how to improve mouse control or drawing.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            comment: { type: Type.STRING },
            tips: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      comment: "The AI is speechless at your drawing skills (or an error occurred).",
      tips: ["Try drawing slower.", "Ensure your mouse pad is clean."]
    };
  }
};
