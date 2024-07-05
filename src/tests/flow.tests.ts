import { runFlow } from "@genkit-ai/flow";
import { defineChatFlow } from "../flows/flow";
import { setupGenkit } from "../genkit";

/**
 * Test suite for Chat Flow Core Functionality.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe("Test - Chat Flow Core Funtionality Tests", () => {
  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    define_chat_flow: true,
    confirm_response_generation: true,
    sending_invalid_chat_id_when_chat_history_is_disabled: true,
    sending_invalid_chat_id_when_chat_history_is_enabled: true,
    test_chat_history_works: true,
    test_cache_works: true,
    test_api_key_is_required: true,
    test_api_key_auth_working: true,
    test_rag_works: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.define_chat_flow)
    test("Define chat flow", () => {
      const flow = defineChatFlow({ endpoint: "test-chat" });
      expect(flow).toBeDefined();
    });

  if (Tests.confirm_response_generation)
    test(
      "Confirm response generation",
      async () => {
        const flow = defineChatFlow({
          endpoint: "test-chat-open-response",
        });
        const response = await runFlow(flow, {
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
