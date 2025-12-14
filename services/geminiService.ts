import { GoogleGenAI } from "@google/genai";
import { Quotation } from "../types";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCoverLetter = async (quotation: Quotation): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Act as a professional interior design sales consultant in India.
      Write a polite, minimalist, and persuasive cover letter email for a quotation.
      
      Client Name: ${quotation.customer.name}
      Project Total: ₹${quotation.total.toLocaleString('en-IN')}
      
      Key Items Included:
      ${quotation.items.map(i => `- ${i.name} (${i.category})`).slice(0, 5).join('\n')}
      
      Tone: Professional, warm, and design-focused. Keep it under 150 words.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Could not generate cover letter.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating content. Please check your API key.";
  }
};

export const enhanceItemDescription = async (itemName: string, category: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    
    const prompt = `
      Write a short, technical but attractive specification description for a modular furniture item.
      Item: ${itemName}
      Category: ${category}
      
      Keep it under 30 words. Focus on durability and finish (e.g. BWR ply, Laminate finish, Soft close hinges).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "";
  }
};