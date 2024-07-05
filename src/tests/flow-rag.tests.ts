import { runFlow } from "@genkit-ai/flow";
import { defineChatFlow } from "../flows/flow";
import { setupGenkit } from "../genkit";
import { getDataRetriever } from "../rag/retrievers/data-retriever";

/**
 * Test suite for Chat Flow Core Functionality.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe("Test - Flow RAG Tests", () => {
  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    test_rag_works: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.test_rag_works)
    test(
      "Test RAG works (w/ Data Retriever, Embedding Generation, RAG-enabled Flow)",
      async () => {
        // define chat flow
        const flow = defineChatFlow({
          endpoint: "test-chat-open-rag",
          enableRAG: true,
          retriever: await getDataRetriever({
            dataType: "csv",
            filePath: "lib/tests/test-data/inventory-data.csv",
            generateEmbeddings: true,
          }),
        });
        try {
          // send test query
          const response = await runFlow(flow, {
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
});
