import {
  defineChatEndpoint,
  getChatEndpointRunner,
} from "../../endpoints/endpoints";
import { setupGenkit } from "../../genkit/genkit";

/**
 * Test suite for testing chat agent config for a chat endpoint.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe("Test - Chat Endpoint Agent Config Tests", () => {
  // Initialize endpoint runner
  const runEndpoint = getChatEndpointRunner();

  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    define_chat_endpoint: true,
    confirm_response_generation: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.define_chat_endpoint)
    test("Define chat endpoint with chat agent config", () => {
      const endpoint = defineChatEndpoint({
        endpoint: "test-chat-agent",
        chatAgentConfig: {
          model: "gemini10Pro",
        },
      });
      expect(endpoint).toBeDefined();
    });

  if (Tests.confirm_response_generation)
    test(
      "Confirm response generation for endpoint with chat agent config",
      async () => {
        const endpoint = defineChatEndpoint({
          endpoint: "test-chat-agent-response",
          chatAgentConfig: {
            model: "gemini10Pro",
            modelConfig: {
              temperature: 0.9,
            },
          },
        });
        const response = await runEndpoint(endpoint, {
          query: "How can you help? In one sentence.",
        });
        expect(response).toBeDefined();
        if (typeof response === "string") {
          // should not be empty
          expect(response.length).toBeGreaterThan(0);
        } else {
          expect(response).toHaveProperty("response");
          if ("response" in response) {
            // should not be empty
            expect(response.response.length).toBeGreaterThan(0);
          } else {
            throw new Error(
              `error in response generation. Response: ${JSON.stringify(response)}`
            );
          }
        }
      },
      defaultTimeout
    );
});
