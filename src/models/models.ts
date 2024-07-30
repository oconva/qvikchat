import {
  gemini15Pro,
  gemini15Flash,
  geminiPro,
  geminiProVision,
} from '@genkit-ai/googleai';
import {
  gpt35Turbo,
  gpt4,
  gpt4o,
  gpt4Turbo,
  gpt4Vision,
  dallE3,
} from 'genkitx-openai';
import {DallE3ConfigSchema} from 'genkitx-openai/lib/dalle';
import {OpenAiConfigSchema} from 'genkitx-openai/lib/gpt';
import {z} from 'zod';

/**
 * List of supported Gemini models.
 */
export const GeminiModels = {
  gemini10Pro: geminiPro.name,
  gemini15Pro: gemini15Pro.name,
  gemini15Flash: gemini15Flash.name,
  geminiProVision: geminiProVision.name,
} as const;

/**
 * List of supported OpenAI models.
 */
export const OpenAIModels = {
  gpt35Turbo: gpt35Turbo.name,
  gpt4o: gpt4o.name,
  gpt4Turbo: gpt4Turbo.name,
  gpt4Vision: gpt4Vision.name,
  gpt4: gpt4.name,
} as const;

/**
 * List of supported DALL-E models.
 */
export const DallEModels = {
  dallE3: dallE3.name,
} as const;

/**
 * List of all supported model names.
 */
export const SupportedModelNames = {
  ...GeminiModels,
  ...OpenAIModels,
  ...DallEModels,
};

/**
 * Get names of all supported models.
 */
export const getSupportedModelNames = () => Object.values(SupportedModelNames);

/**
 * List of supported models.
 */
export type SupportedModels = keyof typeof SupportedModelNames;

/**
 * Supported configuration options for a model
 */
export type GeminiModelConfig = {
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

/**
 * Configuration options for a model.
 */
export type ModelConfig =
  | ({
      name: keyof typeof GeminiModels;
    } & GeminiModelConfig)
  | ({
      name: keyof typeof OpenAIModels;
    } & z.infer<typeof OpenAiConfigSchema>)
  | ({
      name: keyof typeof DallEModels;
    } & z.infer<typeof DallE3ConfigSchema>);

/**
 * Output schema for model responses.
 */
export const OutputSchema = z.union([
  z.object({
    format: z.literal('text').optional(),
  }),
  z.object({
    format: z.literal('json').optional(),
    schema: z.custom<z.ZodTypeAny>().optional(),
  }),
  z.object({
    format: z.literal('media').optional(),
    contentType: z.string(),
  }),
]);

/**
 * Possible output schemas for model responses.
 */
export type OutputSchemaType = z.infer<typeof OutputSchema>;
