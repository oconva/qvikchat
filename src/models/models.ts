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
import {z} from 'zod';
import {GenerationCommonConfigSchema} from '@genkit-ai/ai/model';

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
 * Configuration options for Gemini models.
 */
export type GeminiModelConfig = {
  name: keyof typeof GeminiModels;
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
 * Configuration options for GPT models.
 *
 * May include the following properties:
 * @property {name} - Name of the model.
 * @property {frequencyPenalty} - Frequency penalty for sampling.
 * @property {logitBias} - Logit bias for sampling.
 * @property {logProbs} - Whether to return log probabilities.
 * @property {presencePenalty} - Presence penalty for sampling.
 * @property {seed} - Seed for sampling.
 * @property {topLogProbs} - Top log probabilities to return.
 * @property {user} - User for sampling.
 * @property {visualDetailLevel} - Visual detail level for sampling.
 */
export const OpenAiConfigSchema = GenerationCommonConfigSchema.extend({
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  logitBias: z.record(z.string(), z.number().min(-100).max(100)).optional(),
  logProbs: z.boolean().optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  seed: z.number().int().optional(),
  topLogProbs: z.number().int().min(0).max(20).optional(),
  user: z.string().optional(),
  visualDetailLevel: z.enum(['auto', 'low', 'high']).optional(),
});

/**
 * Configuration options for DALL-E models.
 */
export const DallE3ConfigSchema = GenerationCommonConfigSchema.extend({
  size: z.enum(['1024x1024', '1792x1024', '1024x1792']).optional(),
  style: z.enum(['vivid', 'natural']).optional(),
  user: z.string().optional(),
  quality: z.enum(['standard', 'hd']).optional(),
  response_format: z.enum(['b64_json', 'url']).optional(),
});

/**
 * Configuration options for OpenAI models.
 *
 * May include the following properties:
 * @property {name} - Name of the model.
 * @property {frequencyPenalty} - Frequency penalty for sampling.
 * @property {logitBias} - Logit bias for sampling.
 * @property {logProbs} - Whether to return log probabilities.
 * @property {presencePenalty} - Presence penalty for sampling.
 * @property {seed} - Seed for sampling.
 * @property {topLogProbs} - Top log probabilities to return.
 * @property {user} - User for sampling.
 * @property {visualDetailLevel} - Visual detail level for sampling.
 */
export type OpenAIModelConfig = {
  name: keyof typeof OpenAIModels;
} & z.infer<typeof OpenAiConfigSchema>;

/**
 * Configuration options for DALL-E models.
 *
 * May include the following properties:
 * @property {name} - Name of the model.
 * @property {size} - Size of the output image. One of '1024x1024', '1792x1024', or '1024x1792'.
 * @property {style} - Style of the output image. Can be either 'vivid' or 'natural'.
 * @property {quality} - Quality of the output image.
 * @property {response_format} - Format of the response. Can be either 'b64_json' or 'url'.
 */
export type DallEModelConfig = {
  name: keyof typeof DallEModels;
} & z.infer<typeof DallE3ConfigSchema>;

/**
 * Configuration options for a model.
 *
 * May include the following properties:
 *
 *@prop {name} - Name of the model.
 *@prop {version} - Version of the model.
 *@prop {temperature} - Temperature for sampling.
 *@prop {maxOutputTokens} - Maximum number of tokens to generate.
 *@prop {topK} - Top K tokens to sample from.
 *@prop {topP} - Top P tokens to sample from.
 *@prop {stopSequences} - Sequences to stop generation at.
 *@prop {safetySettings} - Safety settings for the model.
 * @property {size} - Supported only by DALL-E models. Size of the output image. One of '1024x1024', '1792x1024', or '1024x1792'.
 * @property {style} - Supported only by DALL-E models. Style of the output image. Can be either 'vivid' or 'natural'.
 * @property {quality} - Supported only by DALL-E models. Quality of the output image.
 * @property {response_format} - Supported only by DALL-E models. Format of the response. Can be either 'b64_json' or 'url'.
 */
export type ModelConfig =
  | GeminiModelConfig
  | OpenAIModelConfig
  | DallEModelConfig;

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
