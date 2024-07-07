import {
  defineChatEndpoint,
  getChatEndpointRunner,
} from "../endpoints/endpoints";
import { setupGenkit } from "../genkit/genkit";
import { InMemoryChatHistoryStore } from "../history/in-memory-chat-history-store";

/**
 * Test suite for Chat Endpoint - Chat History.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe("Test - Endpoint Chat History Tests", () => {
  // Initialize endpoint runner
  const runEndpoint = getChatEndpointRunner();

  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    sending_invalid_chat_id_when_chat_history_is_disabled: true,
    sending_invalid_chat_id_when_chat_history_is_enabled: true,
    test_chat_history_works: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.sending_invalid_chat_id_when_chat_history_is_disabled)
    test(
      "Sending invalid Chat ID when chat history is disabled",
      async () => {
        const flow = defineChatEndpoint({
          endpoint: "test-chat-open-chat-id-history-disabled",
          enableChatHistory: false,
        });
        const response = await runEndpoint(flow, {
          query: "How can you help? In one sentence.",
          chatId: "test-chat-id",
        });
        expect(response).toBeDefined();
        // expected return type string
        if (typeof response === "string") {
          // should not be empty
          expect(response.length).toBeGreaterThan(0);
        } else {
          throw new Error(
            `Invalid response type. Expected string. Response: ${JSON.stringify(response)}`
          );
        }
      },
      defaultTimeout
    );

  if (Tests.sending_invalid_chat_id_when_chat_history_is_enabled)
    test(
      "Sending invalid Chat ID when chat history is enabled",
      async () => {
        const flow = defineChatEndpoint({
          endpoint: "test-chat-open-chat-id-history-enabled",
          enableChatHistory: true,
          chatHistoryStore: new InMemoryChatHistoryStore(),
        });
        const response = await runEndpoint(flow, {
          query: "How can you help? In one sentence.",
          chatId: "test-chat-id",
        });
        expect(response).toBeDefined();
        expect(response).toHaveProperty("error");
      },
      defaultTimeout
    );

  if (Tests.test_chat_history_works)
    test(
      "Test chat history works",
      async () => {
        const flow = defineChatEndpoint({
          endpoint: "test-chat-open-chat-history",
          enableChatHistory: true,
          chatHistoryStore: new InMemoryChatHistoryStore(),
        });
        const response = await runEndpoint(flow, {
          query: "What is Firebase? In one sentence.",
        });
        expect(response).toBeDefined();
        expect(response).toHaveProperty("chatId");

        if (typeof response !== "string" && "chatId" in response) {
          const chatId = response.chatId;

          // response should not be empty
          expect(response.response.length).toBeGreaterThan(0);

          const secondResponse = await runEndpoint(flow, {
            query: "Can I use it for authentication? In one sentence.",
            chatId,
          });

          expect(secondResponse).toBeDefined();
          expect(secondResponse).toHaveProperty("chatId");

          if (
            typeof secondResponse !== "string" &&
            "chatId" in secondResponse
          ) {
            // response should not be empty
            expect(response.response.length).toBeGreaterThan(0);
            // chat ID should be the same
            expect(secondResponse.chatId).toEqual(chatId);
          } else {
            throw new Error(
              `error in second response. Invalid response object. Response: ${JSON.stringify(response)}`
            );
          }
        } else {
          throw new Error(
            `error in response. Invalid response object. Response: ${JSON.stringify(response)}`
          );
        }
      },
      defaultTimeout
    );
});
