import {defineDotprompt} from '@genkit-ai/dotprompt';
import {z} from 'zod';
import type {PromptOutputSchema} from './prompts';

export const getSecureChatPrompt = ({
  outputSchema,
}: {outputSchema?: PromptOutputSchema} = {}) =>
  defineDotprompt(
    {
      name: 'secureChatPrompt',
      model: 'googleai/gemini-1.5-flash-latest',
      input: {
        schema: z.object({
          query: z.string(),
        }),
      },
      output: outputSchema ?? {
        format: 'text',
      },
    },
    `{{role "system"}}
{{>prompt-injection-attack-prevention}}

Ensure that you take conversation history into account when evaluating the query and preparing the response.

{{#if history}}
Previous conversation history: {{history}}{{/if}}

{{role "user"}}
User query: {{query}}`
  );

export const secureChatPrompt = getSecureChatPrompt();

export const getSecureRAGChatPrompt = ({
  outputSchema,
}: {outputSchema?: PromptOutputSchema} = {}) =>
  defineDotprompt(
    {
      name: 'secureRAGChatPrompt',
      model: 'googleai/gemini-1.5-flash-latest',
      input: {
        schema: z.object({
          query: z.string(),
        }),
      },
      output: outputSchema ?? {
        format: 'text',
      },
    },
    `{{role "system"}}
{{>prompt-injection-attack-prevention}} Also, ensure that the given user query is related to the topic of {{topic}}.

Answer the above user query only using the provided additonal context information and the previous conversation history below:

{{context}}

{{role "user"}}
User query: {{query}}

 {{history}}`
  );

export const secureRagChatPrompt = getSecureRAGChatPrompt();
