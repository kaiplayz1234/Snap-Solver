/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { AIResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function solveWorksheet(imageBase64: string, explainMore: boolean = false): Promise<AIResult> {
  const model = "gemini-3-flash-preview"; // Fast and capable for vision
  
  const prompt = explainMore 
    ? "Look at this worksheet image. Provide the answer to the main question/problem shown. Also, provide a step-by-step explanation and describe the easiest/quickest way to solve it. Respond in JSON format with fields: 'answer', 'explanation', and 'easiestWay'."
    : "Look at this worksheet image. Provide the direct answer to the main question/problem shown. Respond in JSON format with fields: 'answer'.";

  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: imageBase64.split(',')[1] || imageBase64,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";
    return JSON.parse(resultText) as AIResult;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Failed to process worksheet. Please try again.");
  }
}
