import {
  defineChatEndpoint,
  getChatEndpointRunner,
} from "../endpoints/endpoints";
import { setupGenkit } from "../genkit/genkit";
import { InMemoryChatHistoryStore } from "../history/in-memory-chat-history-store";
import { getDataRetriever } from "../rag/data-retrievers/data-retrievers";

/**
 * Test suite for Chat Endpoint RAG Functionality.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe("Test - Endpoint RAG Tests", () => {
  // Initialize endpoint runner
  const runEndpoint = getChatEndpointRunner();

  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    test_rag_works: true,
    test_rag_works_with_history: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.test_rag_works)
    test(
      "Test RAG works (w/ Data Retriever, Embedding Generation, RAG-enabled Endpoint)",
      async () => {
        // define chat endpoint
        const endpoint = defineChatEndpoint({
          endpoint: "test-chat-open-rag",
          topic: "store inventory",
          enableRAG: true,
          retriever: await getDataRetriever({
            dataType: "csv",
            filePath: "src/tests/test-data/inventory-data.csv",
            generateEmbeddings: true,
          }),
        });
        try {
          // send test query
          const response = await runEndpoint(endpoint, {
            query: "What is the price of Seagate ST1000DX002?",
          });

          // check response is valid and does not contain error
          expect(response).toBeDefined();
          expect(response).not.toHaveProperty("error");

          // confirm response type
          if (typeof response === "string") {
            // should not be empty
            expect(response.length).toBeGreaterThan(0);
            // should contain 68.06
            expect(response).toContain("68.06");
          } else {
            expect(response).toHaveProperty("response");
            if ("response" in response) {
              // should not be empty
              expect(response.response.length).toBeGreaterThan(0);
              // should contain 68.06
              expect(response.response).toContain("68.06");
            } else {
              throw new Error(
                `Response field invalid. Response: ${JSON.stringify(response)}`
              );
            }
          }
        } catch (error) {
          throw new Error(`Error in test. Error: ${error}`);
        }
      },
      defaultTimeout
    );

  if (Tests.test_rag_works_with_history)
    test(
      "Test RAG works (w/ Chat History)",
      async () => {
        // define chat endpoint
        const endpoint = defineChatEndpoint({
          endpoint: "test-chat-open-rag",
          topic: "store inventory",
          enableRAG: true,
          retriever: await getDataRetriever({
            dataType: "csv",
            filePath: "src/tests/test-data/inventory-data.csv",
            generateEmbeddings: true,
          }),
          enableChatHistory: true,
          chatHistoryStore: new InMemoryChatHistoryStore(),
        });
        try {
          // send test query
          const response = await runEndpoint(endpoint, {
            query: "What is the price of Seagate ST1000DX002?",
          });

          // check response is valid and does not contain error
          expect(response).toBeDefined();

          // if error is present, throw error
          if (
            response !== "string" &&
            Object.keys(response).includes("error")
          ) {
            throw new Error(`${JSON.stringify(response)}`);
          }
          expect(response).toHaveProperty("response");
          expect(response).toHaveProperty("chatId");

          if (typeof response !== "string" && "chatId" in response) {
            const chatId = response.chatId;

            // response should not be empty
            expect(response.response.length).toBeGreaterThan(0);

            // confirm response accuracy
            // should contain 68.06
            expect(response.response).toContain("68.06");

            const secondResponse = await runEndpoint(endpoint, {
              query: "How many of these do we have in stock?",
              chatId,
            });

            expect(secondResponse).toBeDefined();

            // if error is present, throw error
            if (
              secondResponse !== "string" &&
              Object.keys(secondResponse).includes("error")
            ) {
              throw new Error(`${JSON.stringify(secondResponse)}`);
            }

            expect(secondResponse).toHaveProperty("response");
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
                `error in second response. Invalid response object. Response: ${JSON.stringify(secondResponse)}`
              );
            }
          } else {
            throw new Error(
              `Response field invalid. Response: ${JSON.stringify(response)}`
            );
          }
        } catch (error) {
          throw new Error(`Error in test. Error: ${error}`);
        }
      },
      defaultTimeout
    );
});
