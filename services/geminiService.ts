
import { GoogleGenAI, Type } from "@google/genai";

// Fix: Per coding guidelines, initialize GoogleGenAI directly with the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
            text: `Analyze the image of this alcoholic beverage. Identify its brand, name, and estimate its nutritional information for a standard serving. Provide a reasonable price estimate in USD.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: drinkSchema,
      },
    });

    const jsonText = response.text.trim();
    const data = JSON.parse(jsonText);
    return data;
  } catch (error) {
    console.error("Error analyzing drink image with Gemini:", error);
    throw new Error("Failed to analyze image. The AI model could not identify the drink.");
  }
};