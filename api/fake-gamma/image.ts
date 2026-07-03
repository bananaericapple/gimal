import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey =
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ error: 'Missing GEMINI API key' });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: `Professional presentation visual, cinematic, high quality, 16:9: ${prompt}` }],
        },
      ],
    });

    const parts = response.response.candidates?.[0]?.content?.parts;
    const inline = parts?.find((part: any) => part.inlineData);
    if (inline?.inlineData?.data) {
      return res.status(200).json({ image: `data:image/png;base64,${inline.inlineData.data}` });
    }

    return res.status(500).json({ error: 'Image generation failed' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error?.message || 'Server error' });
  }
}
