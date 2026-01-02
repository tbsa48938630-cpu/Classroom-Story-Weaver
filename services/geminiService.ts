
import { GoogleGenAI, Type } from "@google/genai";
import { Story } from "../types";

export async function generateStoryStructure(keywords: string, moral: string, style: string): Promise<Story> {
  // 每次呼叫時才建立實例，確保環境變數已準備就緒
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `你是一位世界級的兒童繪本作家與國小老師。
請根據以下關鍵字創作一個生動、有趣的短篇故事：
關鍵字：${keywords}
教育目的或寓意：${moral}
插畫風格建議：${style}

請生成一個包含 4 到 5 頁的繪本故事。
每一頁應包含：
1. 繁體中文故事內文（適合國小生朗讀）。
2. 一段英文的視覺描述（visualPrompt），用於 AI 生成插圖。視覺描述應保持角色一致性，並符合「${style}」風格。

請以 JSON 格式回應，包含 title 和 pages 陣列。`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          pages: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                visualPrompt: { type: Type.STRING }
              },
              required: ["text", "visualPrompt"]
            }
          }
        },
        required: ["title", "pages"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

export async function generateIllustration(visualPrompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: visualPrompt }
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "4:3",
      }
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("無法生成圖片，請檢查 API Key 或網路連線。");
}
