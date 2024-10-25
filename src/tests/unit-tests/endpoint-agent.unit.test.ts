import {z} from 'zod';
import {
  defineChatEndpoint,
  getChatEndpointRunner,
  setupGenkit,
} from '../../index';

/**
 * Test suite for testing chat agent config for a chat endpoint.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe('Test - Chat Endpoint Agent Config Tests', () => {
  // Initialize endpoint runner
  const runEndpoint = getChatEndpointRunner();

  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    define_chat_endpoint: true,
    define_chat_endpoint_with_dall_e_model: true,
    define_chat_endpoint_with_json_output_schema: true,
    define_chat_endpoint_with_custom_system_prompt: true,
    confirm_response_generation: true,
    confirm_json_response_generation: true,
    confirm_dall_e_image_generation: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.define_chat_endpoint)
    test('Define chat endpoint with chat agent config', () => {
      const endpoint = defineChatEndpoint({
        endpoint: 'test-chat-agent',
        modelConfig: {
          name: 'gemini15Flash',
        },
      });
      expect(endpoint).toBeDefined();
    });

  if (Tests.define_chat_endpoint_with_dall_e_model)
    test('Define chat endpoint with chat agent config and DALL-E model', () => {
      const endpoint = defineChatEndpoint({
        endpoint: 'test-chat-agent-dall-e',
        modelConfig: {
          name: 'dallE3',
        },
      });
      expect(endpoint).toBeDefined();
    });

  if (Tests.define_chat_endpoint_with_json_output_schema)
    test('Define chat endpoint with chat agent config and json output schema', () => {
      const endpoint = defineChatEndpoint({
        endpoint: 'test-chat-agent-json-output-schema',
        outputSchema: {
          format: 'json',
          schema: z.object({
            answer: z.string(),
          }),
        },
      });
      expect(endpoint).toBeDefined();
    });

  if (Tests.confirm_response_generation)
    test(
      'Confirm response generation for endpoint with chat agent config',
      async () => {
        const endpoint = defineChatEndpoint({
          endpoint: 'test-chat-agent-response',
        });
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

        // response should be string when responseType not specified in endpoint config
        if (typeof response.response !== 'string') {
          throw new Error(
            `Invalid response object. Response: ${JSON.stringify(response)}`
          );
        }

        // should not be empty
        expect(response.response.length).toBeGreaterThan(0);

        // response should contain the word "Firestore"
        expect(response.response.toLowerCase()).toContain('firestore');
      },
      defaultTimeout
    );

  if (Tests.confirm_json_response_generation)
    test(
      'Confirm JSON response generation for endpoint with chat agent config',
      async () => {
        const endpoint = defineChatEndpoint({
          endpoint: 'test-chat-agent-json-response',
          outputSchema: {
            format: 'json',
            schema: z.object({
              answer: z.string(),
            }),
          },
        });
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

        // should not be empty
        expect(response.response).toBeDefined();

        // parse response
        const parsedResponse = response.response as {
          answer: string;
        };

        // should have answer field
        if (!('answer' in parsedResponse)) {
          throw new Error(
            `Invalid response object. Missing 'answer' field. Response: ${JSON.stringify(response)}`
          );
        }

        // response should contain the word "Firestore"
        expect(parsedResponse.answer.toLowerCase()).toContain('firestore');
      },
      defaultTimeout
    );

  if (Tests.confirm_dall_e_image_generation)
    test.skip(
      'Confirm DALL-E image generation for endpoint with chat agent config',
      async () => {
        const endpoint = defineChatEndpoint({
          endpoint: 'test-chat-agent-dall-e-image',
          modelConfig: {
            name: 'dallE3',
            response_format: 'url',
          },
          outputSchema: {
            format: 'media',
            contentType: 'image/png',
          },
        });
        const response = await runEndpoint(endpoint, {
          query: 'Generate an image of a cat.',
        });
        expect(response).toBeDefined();

        // should not contain error
        if ('error' in response) {
          throw new Error(
            `Error in response. Response: ${JSON.stringify(response)}`
          );
        }

        // should not be empty
        expect(response.response).toBeDefined();

        // parse response
        const parsedResponse = response.response as {
          url: string;
        };

        // should have URL field
        if (!('url' in parsedResponse)) {
          throw new Error(
            `Invalid response object. Missing 'url' field. Response: ${JSON.stringify(response)}`
          );
        }

        // should have URL
        expect(parsedResponse.url).toBeDefined();
        // valid URL
        expect(parsedResponse.url).toMatch(/^(http|https):\/\/[^ "]+$/);
      },
      defaultTimeout * 30
    );
});
