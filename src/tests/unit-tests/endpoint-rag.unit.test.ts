import {
  defineChatEndpoint,
  getChatEndpointRunner,
  setupGenkit,
} from '../../index';
import {getDataRetriever} from '../../rag/data-retrievers/data-retrievers';
import {CSVLoader} from '@langchain/community/document_loaders/fs/csv';

/**
 * Test suite for Chat Endpoint RAG Functionality.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe('Test - Endpoint RAG Tests', () => {
  // Initialize endpoint runner
  const runEndpoint = getChatEndpointRunner();

  beforeAll(() => {
    setupGenkit();
  });

  // Tests to be performed
  // Set to true to run the test
  const Tests = {
    test_rag_works: true,
    test_rag_works_providing_docs: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.test_rag_works)
    test(
      'Test RAG works (w/ Data Retriever, Embedding Generation, RAG-enabled Endpoint)',
      async () => {
        // define chat endpoint
        const endpoint = defineChatEndpoint({
          endpoint: 'test-chat-open-rag',
          topic: 'store inventory',
          enableRAG: true,
          retriever: await getDataRetriever({
            dataType: 'csv',
            filePath: 'src/tests/test-data/inventory-data.csv',
            generateEmbeddings: true,
          }),
        });
        try {
          // send test query
          const response = await runEndpoint(endpoint, {
            query: 'What is the price of Seagate ST1000DX002?',
          });

          // check response is valid and does not contain error
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

          // should contain 68.06
          expect(response.response).toContain('68.06');
        } catch (error) {
          throw new Error(`Error in test. Error: ${error}`);
        }
      },
      defaultTimeout
    );

  if (Tests.test_rag_works_providing_docs)
    test(
      'Test RAG works when providing docs',
      async () => {
        // configure data loader
        const loader = new CSVLoader('src/tests/test-data/inventory-data.csv');
        // get documents
        const docs = await loader.load();

        // define chat endpoint
        const endpoint = defineChatEndpoint({
          endpoint: 'test-chat-open-rag-docs',
          topic: 'store inventory',
          enableRAG: true,
          retriever: await getDataRetriever({
            docs,
            dataType: 'csv', // need to specify data type when providing docs
            generateEmbeddings: true,
          }),
        });
        try {
          // send test query
          const response = await runEndpoint(endpoint, {
            query: 'What is the price of Seagate ST1000DX002?',
          });

          // check response is valid and does not contain error
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

          // should contain 68.06
          expect(response.response).toContain('68.06');
        } catch (error) {
          throw new Error(`Error in test. Error: ${error}`);
        }
      },
      defaultTimeout
    );
});
