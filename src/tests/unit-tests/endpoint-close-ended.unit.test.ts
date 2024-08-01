import {
  defineChatEndpoint,
  getChatEndpointRunner,
  setupGenkit,
} from '../../index';

/**
 * Test suite for Close-ended Chat Endpoint.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe('Test - Close-ended Chat Endpoint Tests', () => {
  // Initialize endpoint runner
  const runEndpoint = getChatEndpointRunner();

  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    define_close_ended_chat: true,
    confirm_response_generation: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.define_close_ended_chat)
    test('Define chat endpoint', () => {
      const endpoint = defineChatEndpoint({
        endpoint: 'test-chat-close',
        agentType: 'close-ended',
        topic: 'Firebase',
      });
      expect(endpoint).toBeDefined();
    });

  if (Tests.confirm_response_generation)
    test(
      'Confirm response generation',
      async () => {
        const endpoint = defineChatEndpoint({
          endpoint: 'test-chat-close-response',
          agentType: 'close-ended',
          topic: 'Firebase',
        });
        const response = await runEndpoint(endpoint, {
          query: 'How can you help? In one sentence.',
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
      },
      defaultTimeout
    );
});
