import {z} from 'zod';
import {
  defineChatEndpoint,
  getChatEndpointRunner,
  setupGenkit,
} from '../../index';
import {defineDotprompt} from '@genkit-ai/dotprompt';

/**
 * Test suite for testing chat endpoints with custom prompts.
 */
describe('Test - Chat Endpoint Custom Prompts Tests', () => {
  // Initialize endpoint runner
  const runEndpoint = getChatEndpointRunner();

  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    define_chat_endpoint_with_custom_system_prompt: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.define_chat_endpoint_with_custom_system_prompt)
    test(
      'Define chat endpoint with custom system prompt',
      async () => {
        // define custom system prompt
        const customSystemPrompt = defineDotprompt(
          {
            input: {
              schema: z.object({
                query: z.string().optional(),
              }),
            },
            output: {
              format: 'text',
            },
          },
          `{{role "system"}}
            Answer user query with humor. If no query is provided, greet the user with a funny message.
            
            {{#if query}}
            {{role "user"}}
            User query
            {{query}}
            {{/if}}`
        );
        const endpoint = defineChatEndpoint({
          endpoint: 'test-custom-system-prompt',
          systemPrompt: customSystemPrompt,
        });
        expect(endpoint).toBeDefined();

        const response = await runEndpoint(endpoint, {
          query:
            'Answer in one sentence: What is Firebase Firestore? Must contain the word "Firestore" in your response.',
        });
        expect(response).toBeDefined();

        // should not contain error
        if ('error' in response) {
          throw new Error(
            `Error in response. Response: ${JSON.stringify(response)}`
          );
        }

        // response should be string since output format is text
        if (typeof response.response !== 'string') {
          throw new Error(
            `Invalid response object. Response: ${JSON.stringify(response)}`
          );
        }

        // should not be empty
        expect(response.response.length).toBeGreaterThan(0);
      },
      defaultTimeout
    );
});
