import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// NOTE: In a real production build, this should be proxied through the Laravel backend
// to protect the API key. For this demo, we use the env variable directly as requested.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingContent = async (
  segment: string,
  goal: string,
  tone: string
): Promise<string> => {
  try {
    const prompt = `
      Act as a professional marketing copywriter for a high-end beauty salon called "LuxeSalon".
      Write a short, engaging marketing message (suitable for WhatsApp or SMS) for the following customer segment: "${segment}".
      The goal of the campaign is: "${goal}".
      The tone should be: "${tone}".
      
      Keep it under 160 characters if possible, but max 300. Include placeholders like [Name] if needed. 
      Add emojis where appropriate.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "Could not generate content. Please try again.";
  } catch (error) {
    console.error("Error generating content:", error);
    return "Error connecting to AI service. Please check your API key.";
  }
};

export const analyzeCustomerSentiment = async (feedback: string): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the sentiment of this salon customer feedback. Return ONLY one word: 'Positive', 'Neutral', or 'Negative'. Feedback: "${feedback}"`,
    });
    return response.text?.trim() || "Neutral";
   } catch (e) {
     return "Neutral";
   }
}
