import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

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

  const { content, audience, mood } = req.body || {};

  if (!content || !audience || !mood) {
    return res.status(400).json({ error: 'content, audience, mood are required' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            slides: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  slideNumber: { type: SchemaType.NUMBER },
                  type: { type: SchemaType.STRING, enum: ['cover', 'content', 'quote', 'final'] },
                  headline: { type: SchemaType.STRING },
                  subtext: { type: SchemaType.STRING },
                  bullets: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                  imagePrompt: { type: SchemaType.STRING },
                  script: { type: SchemaType.STRING },
                },
                required: ['slideNumber', 'type', 'headline', 'imagePrompt', 'script'],
              },
            },
          },
          required: ['title', 'slides'],
        },
      },
    });

    const response = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `발표 원문: ${content}\n대상: ${audience}\n분위기: ${mood}`,
            },
            {
              text: `너는 Fake(Gamma.AI) 엔진이다.
사용자의 텍스트를 분석하여 "바로 발표에 사용할 수 있는" 5~8장의 슬라이드 데크를 생성하라.

슬라이드 제작 규칙:
1. 슬라이드 타입: 'cover', 'content', 'quote', 'final'을 적절히 섞어라.
2. Gamma.app 특유의 미니멀하고 감각적인 텍스트 배치를 사용하라.
3. 모든 슬라이드에 이미지 생성을 위한 상세한 영어 프롬프트를 포함하라.
4. 'script' 필드에는 발표자가 실제로 청중에게 할 말을 친근하고 자연스럽게 작성하라.

결과는 반드시 한국어로 작성하되, imagePrompt만 영어로 작성하라.`,
            },
          ],
        },
      ],
    });

    const jsonStr = response.response.text();
    if (!jsonStr) {
      return res.status(500).json({ error: 'Empty response' });
    }

    return res.status(200).json(JSON.parse(jsonStr));
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error?.message || 'Server error' });
  }
}
