import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'GEMINI_API_KEY not found in environment variables ❌',
      }, { status: 500 });
    }

    // Initialize Gemini with new SDK
    const ai = new GoogleGenAI({ apiKey });

    // Try different models in order of preference
    const modelsToTry = [
      modelName,
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        // Test with a simple prompt
        const prompt = "Say 'Hello from Gemini API! Test successful.' in one sentence.";

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });

        const text = response.text;

        return NextResponse.json({
          success: true,
          message: 'Gemini API connection successful! ✅',
          data: {
            modelUsed: model,
            modelRequested: modelName,
            prompt,
            response: text,
            timestamp: new Date().toISOString(),
          }
        });
      } catch (error) {
        console.log(`Model ${model} failed:`, error);
        lastError = error;
        continue;
      }
    }

    throw lastError || new Error('All models failed');

  } catch (error) {
    console.error('Gemini API error:', error);

    return NextResponse.json({
      success: false,
      message: 'Gemini API connection failed ❌',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
