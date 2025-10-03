
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Per coding guidelines, initialize GoogleGenAI directly with the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy-key' });

const drinkSchema = {
  type: Type.OBJECT,
  properties: {
    brand: { type: Type.STRING, description: "The brand name of the beverage. e.g., 'Heineken', 'Jack Daniel's'" },
    name: { type: Type.STRING, description: "The specific name or type of the drink. e.g., 'Lager', 'Old No. 7 Tennessee Whiskey'" },
    volume: { type: Type.NUMBER, description: "Estimated standard serving volume in milliliters (ml). Beer can/bottle: 355, wine glass: 150, shot: 44." },
    abv: { type: Type.NUMBER, description: "Alcohol By Volume as a percentage value. e.g., 5.0" },
    calories: { type: Type.NUMBER, description: "Estimated calories per serving." },
    carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams per serving." },
    sugar: { type: Type.NUMBER, description: "Estimated sugar in grams per serving." },
    price: { type: Type.NUMBER, description: "Estimated price in USD for a single serving." }
  },
  required: ["brand", "name", "volume", "abv", "calories", "carbs", "sugar", "price"]
};


export const analyzeDrinkImage = async (base64Image: string, mimeType: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API key not configured. Please set GEMINI_API_KEY environment variable.");
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Analyze the image of this alcoholic beverage. Identify its brand, name, and estimate its nutritional information for a standard serving. Provide a reasonable price estimate in USD. IMPORTANT: You must respond with only the JSON object, without any additional text or markdown formatting.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: drinkSchema,
      },
    });

    let jsonText = response.text?.trim();

    if (!jsonText) {
      throw new Error("The AI model returned an empty response.");
    }

    // Clean up potential markdown formatting (e.g., ```json ... ```)
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7, -3).trim();
    }

    try {
      const data = JSON.parse(jsonText);
      return data;
    } catch (parseError) {
      console.error("Failed to parse JSON from AI response:", parseError);
      console.error("Raw AI response text was:", jsonText);
      throw new Error("The AI model returned an invalid format. Please try again.");
    }

  } catch (error: any) {
    console.error("Error analyzing drink image with Gemini:", error);
    // Re-throw our more specific, user-friendly errors
    if (error.message.startsWith("The AI model")) {
        throw error;
    }
    // Fallback for other API errors
    throw new Error("Failed to analyze image. The AI model could not identify the drink.");
  }
};
