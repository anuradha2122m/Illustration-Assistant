import { GoogleGenAI, Type, Modality } from "@google/genai";
import { GeneratedImage, TaggedPrompt } from "../types";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generatePromptsForArticle(article: string): Promise<TaggedPrompt[]> {
  const systemInstruction = `You are an expert art director for a major news publication. Your task is to read the provided news article and generate 10 distinct, highly descriptive, and visually compelling prompt objects for an AI image generator. Each object must have a 'tag' (a single, descriptive category) and a 'prompt' (the full text for the generator). The prompts must capture the essence, mood, and key themes of the article. The most critical part of your task is to ensure extreme diversity in the prompts. Each prompt should propose a completely different artistic interpretation or visual metaphor. For the 'tag', use concise style descriptors like 'Photorealistic', 'Abstract', 'Illustration', 'Conceptual Art', 'Minimalist', 'Cinematic', 'Vector Graphic'. Push the creative boundaries. Offer a wide range of styles. Ensure all generated prompts adhere to safety policies for image generation models and are suitable for a general audience.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: article,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          prompts: {
            type: Type.ARRAY,
            description: "An array of 10 distinct prompt objects, each with a style 'tag' and a full 'prompt' text.",
            items: {
              type: Type.OBJECT,
              properties: {
                tag: {
                  type: Type.STRING,
                  description: "A short, descriptive tag for the artistic style (e.g., 'Photorealistic', 'Abstract')."
                },
                prompt: {
                  type: Type.STRING,
                  description: "The full, descriptive prompt for the image generator."
                }
              },
              required: ["tag", "prompt"]
            }
          }
        },
        required: ["prompts"],
      },
    },
  });

  const jsonText = response.text.trim();
  const result = JSON.parse(jsonText);

  if (result && Array.isArray(result.prompts)) {
    // Basic validation that the structure is correct
    if (result.prompts.every((p: any) => typeof p.tag === 'string' && typeof p.prompt === 'string')) {
        return result.prompts;
    }
  }
  
  throw new Error("Failed to parse valid tagged prompts from the API response.");
}

export async function generateImageFromPrompt(prompt: string): Promise<GeneratedImage> {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: '16:9',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const imageData = response.generatedImages[0].image;
    return {
      base64: imageData.imageBytes,
      mimeType: imageData.mimeType,
    };
  }

  throw new Error("Image generation failed or returned no images.");
}

export async function refineImage(base64Image: string, mimeType: string, prompt: string): Promise<GeneratedImage> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return {
                base64: part.inlineData.data,
                mimeType: part.inlineData.mimeType,
            };
        }
    }

    throw new Error("Image refinement failed to return a new image.");
}

export async function generateTagsForImage(base64Image: string, article: string): Promise<string[]> {
    const systemInstruction = `You are an expert SEO and content manager. Analyze the provided news article and the accompanying image. Based on both, generate an array of 5 to 8 relevant, concise keywords or tags. These tags should be suitable for image alt-text, SEO, and content categorization. Focus on the key subjects, themes, and objects depicted.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: `Here is the article for context:\n\n${article}` },
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: 'image/png',
                    },
                },
                { text: "Now, please generate the tags based on the system instruction." }
            ],
        },
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tags: {
                        type: Type.ARRAY,
                        description: "An array of 5 to 8 relevant SEO keywords and tags.",
                        items: {
                            type: Type.STRING
                        }
                    }
                },
                required: ["tags"],
            },
        },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result && Array.isArray(result.tags)) {
        return result.tags;
    }

    throw new Error("Failed to parse valid tags from the API response.");
}