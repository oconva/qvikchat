import {
  defineChatEndpoint,
  getChatEndpointRunner,
} from "../endpoints/endpoints";
import { InMemoryAPIKeyStore } from "../auth/in-memory-api-key-store";
import { generateAlphaNumericString } from "../utils/utils";
import { setupGenkit } from "../genkit/genkit";

/**
 * Test suite for Chat Endpoint - API Keys.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe("Test - Endpoint API Keys Tests", () => {
  // Initialize endpoint runner
  const runEndpoint = getChatEndpointRunner();

  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    test_api_key_is_required: true,
    test_api_key_auth_working: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.test_api_key_is_required)
    test(
      "Test API Key is required",
      async () => {
        // Initialize API key store
        const apiKeyStore = new InMemoryAPIKeyStore();
        // add a test API key
        const key = generateAlphaNumericString();
        apiKeyStore.addKey(key, {
          uid: "test-user",
          status: "active",
          endpoints: "all", // allow access to all endpoints
        });
        // define chat endpoint
        const endpoint = defineChatEndpoint({
          endpoint: "test-chat-open-api-key-required",
          enableAuth: true,
          apiKeyStore,
        });

        let response;

        try {
          // send test query without API key
          response = await runEndpoint(endpoint, {
            query: "How can you help? In one sentence.",
            uid: "test-user",
          });

          throw new Error(
            `Expected an error to be thrown. Instead received response: ${JSON.stringify(response)}`
          );
        } catch (error) {
          // check response is undefined
          expect(response).not.toBeDefined();
          // check error message is valid
          expect(error).toBeDefined();
        }
      },
      defaultTimeout
    );

  if (Tests.test_api_key_auth_working)
    test(
      "Test API Key auth working",
      async () => {
        // Initialize API key store
        const apiKeyStore = new InMemoryAPIKeyStore();
        // Test user ID and key
        const testUID = "test-user";
        // add a test API key
        const testKey = generateAlphaNumericString();
        apiKeyStore.addKey(testKey, {
          uid: testUID,
          status: "active",
          endpoints: "all", // allow access to all endpoints
        });
        // define chat endpoint
        const endpoint = defineChatEndpoint({
          endpoint: "test-chat-open-api-key-auth-working",
          enableAuth: true,
          apiKeyStore,
        });
        try {
          // send test query with API key
          const response = await runEndpoint(
            endpoint,
            {
              query: "How can you help? In one sentence.",
              uid: testUID,
            },
            {
              withLocalAuthContext: {
                key: testKey,
              },
            }
          );
          // check response is valid and does not contain error
          expect(response).toBeDefined();
          expect(response).not.toHaveProperty("error");
        } catch (error) {
          throw new Error(`Error in test. Error: ${error}`);
        }
      },
      defaultTimeout
    );
});
