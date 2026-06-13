import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
        return NextResponse.json({ imageUrl });
      }
    }

    return NextResponse.json({ error: "No image generated" }, { status: 500 });
  } catch (error: unknown) {
    console.error("Error generating cover:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate cover";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
