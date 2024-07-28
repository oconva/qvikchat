import {JSONSchema} from '@genkit-ai/core/schema';
import {z} from 'zod';

// export prompts

/**
 * Type to define the output schema for a prompt.
 */
export type PromptOutputSchema = {
  /** Desired output format. */
  format?: 'text' | 'media' | 'json';
  /** Zod schema defining the output structure (cannot be specified with non-json format). */
  schema?: z.ZodTypeAny;
  /** JSON schema of desired output (cannot be specified with non-json format). */
  jsonSchema?: JSONSchema;
};

export {
  openEndedSystemPrompt,
  closeEndedSystemPrompt,
  ragSystemPrompt,
} from './system-prompts';

export {secureChatPrompt, secureRagChatPrompt} from './chat-prompts';
