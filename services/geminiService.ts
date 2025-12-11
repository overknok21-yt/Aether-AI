import { GoogleGenAI, Type } from "@google/genai";
import { AppMode, ImageGenConfig } from "../types";

// Helper to check for specific key requirements (Veo/Pro Image)
const checkPaidKeySelection = async () => {
  if ((window as any).aistudio && (window as any).aistudio.hasSelectedApiKey) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      if ((window as any).aistudio.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        return true;
      }
    }
  }
  return true;
};

// Error handler that triggers key selection and retries if entity not found (API Key issue)
const withErrorHandling = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await operation();
  } catch (error: any) {
    // Check for "Requested entity was not found" (404) which often indicates missing/invalid API key selection for paid models
    if (
      (error.message && error.message.includes("Requested entity was not found")) ||
      error.status === 404 ||
      error.code === 404
    ) {
      if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        // Retry the operation once after the user has potentially selected a key
        return await operation();
      }
    }
    throw error;
  }
};

const getClient = () => {
  // Always create a new client to pick up the latest process.env.API_KEY
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- Text & Vision Chat ---

export const generateChatResponse = async (
  history: { role: string; parts: any[] }[],
  lastMessage: string,
  mode: AppMode,
  imagePart?: { inlineData: { data: string; mimeType: string } }
) => {
  return withErrorHandling(async () => {
    const ai = getClient();
    
    // Model Selection
    // Flash: gemini-2.5-flash (Standard, reliable)
    // Detail: gemini-3-pro-preview (Thinking, Complex tasks)
    const modelName = mode === 'detail' 
      ? 'gemini-3-pro-preview' 
      : 'gemini-2.5-flash';

    const config: any = {
      systemInstruction: "You are Aether, a helpful, intelligent AI assistant.",
    };

    if (mode === 'detail') {
      config.thinkingConfig = { thinkingBudget: 32768 };
    } 

    const contents = [...history];
    
    const currentParts: any[] = [{ text: lastMessage }];
    if (imagePart) {
      currentParts.unshift(imagePart);
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: config
    });

    return response.text;
  });
};

// --- Image Generation & Editing ---

export const generateImage = async (
  prompt: string,
  mode: AppMode,
  config: ImageGenConfig,
  referenceImage?: { data: string; mimeType: string }
) => {
  return withErrorHandling(async () => {
    // Model Selection
    let modelName = 'gemini-2.5-flash-image';
    
    if (mode === 'detail') {
      await checkPaidKeySelection(); // Required for Pro Image
      modelName = 'gemini-3-pro-image-preview';
    }

    const ai = getClient();

    const parts: any[] = [{ text: prompt }];
    
    if (referenceImage) {
      parts.unshift({
        inlineData: referenceImage
      });
    }

    const generationConfig: any = {
      imageConfig: {
        aspectRatio: config.aspectRatio,
      }
    };

    // Only Pro supports size
    if (mode === 'detail') {
      generationConfig.imageConfig.imageSize = config.size;
    }
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: generationConfig
    });

    // Extract Image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  });
};