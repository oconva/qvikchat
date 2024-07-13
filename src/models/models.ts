import {
  gemini15Pro,
  gemini15Flash,
  geminiPro,
  geminiProVision,
} from '@genkit-ai/googleai';
import {gpt35Turbo, gpt4, gpt4o, gpt4Turbo, gpt4Vision} from 'genkitx-openai';

/**
 * Names of supported models.
 */
export const SupportedModelNames = {
  gemini10Pro: geminiPro.name,
  gemini15Pro: gemini15Pro.name,
  gemini15Flash: gemini15Flash.name,
  geminiProVision: geminiProVision.name,
  gpt35Turbo: gpt35Turbo.name,
  gpt4o: gpt4o.name,
  gpt4Turbo: gpt4Turbo.name,
  gpt4Vision: gpt4Vision.name,
  gpt4: gpt4.name,
} as const;

export const getSupportedModelNames = () => Object.values(SupportedModelNames);

/**
 * List of supported models.
 */
export type SupportedModels = keyof typeof SupportedModelNames;

/**
 * Supported configuration options for a model
 */
export type ModelConfig = {
  version?: string | undefined;
  temperature?: number | undefined;
  maxOutputTokens?: number | undefined;
  topK?: number | undefined;
  topP?: number | undefined;
  stopSequences?: string[] | undefined;
  safetySettings?:
    | {
        category:
          | 'HARM_CATEGORY_UNSPECIFIED'
          | 'HARM_CATEGORY_HATE_SPEECH'
          | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
          | 'HARM_CATEGORY_HARASSMENT'
          | 'HARM_CATEGORY_DANGEROUS_CONTENT';
        threshold:
          | 'BLOCK_LOW_AND_ABOVE'
          | 'BLOCK_MEDIUM_AND_ABOVE'
          | 'BLOCK_ONLY_HIGH'
          | 'BLOCK_NONE';
      }[]
    | undefined;
};
