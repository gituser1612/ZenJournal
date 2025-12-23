
import { GoogleGenAI } from "@google/genai";

export const geminiService = {
  async generateInsight(content: string): Promise<string> {
    try {
      // Create instance right before use to ensure it uses the latest key if updated
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a supportive, mindful journaling assistant. Analyze the following journal entry and provide a brief (2-3 sentences), encouraging insight or a reflective question to help the writer process their day. 
        
        Entry: "${content}"`,
        config: {
          temperature: 0.7,
        }
      });

      return response.text || "Keep writing! Every entry is a step toward clarity.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to generate insight at the moment, but your reflection is valuable.";
    }
  }
};
