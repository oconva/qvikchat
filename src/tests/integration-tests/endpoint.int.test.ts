import {CacheCollection, InMemoryCacheStore} from '../../cache/cache-store';
import {InMemoryChatHistoryStore} from '../../history/in-memory-chat-history-store';
import {
  defineChatEndpoint,
  getChatEndpointRunner,
} from '../../endpoints/endpoints';
import {setupGenkit} from '../../genkit/genkit';

/**
 * Test suite for Chat Endpoint Basic Functionality.
 *
 * Some tests include the use of LLM model, defining a chat agent, defining API key store, defining chat history store, and defining cache store.
 */
describe('Test - Chat Endpoint Core Funtionality Tests', () => {
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
    test_chat_history_cache_rag: true,
  };

  // default test timeout
  const defaultTimeout = 10000; // 10 secondss

  if (Tests.define_chat_endpoint)
    test('Define chat endpoint', () => {
      const endpoint = defineChatEndpoint({endpoint: 'test-chat'});
      expect(endpoint).toBeDefined();
    });

  if (Tests.confirm_response_generation)
    test(
      'Confirm response generation',
      async () => {
        const endpoint = defineChatEndpoint({
          endpoint: 'test-chat-open-response',
        });
        const response = await runEndpoint(endpoint, {
          query: 'How can you help? In one sentence.',
        });
        expect(response).toBeDefined();
        expect(response).toHaveProperty('response');
        if ('response' in response) {
          // should be defined
          expect(response.response).toBeDefined();
          // if of type string (when using responseType 'text' or 'json')
          if (typeof response.response === 'string') {
            // should not be empty
            expect(response.response.length).toBeGreaterThan(0);
          } else {
            // throw error if response is not a string
            throw new Error(
              `Invalid response object. Expected string. Response: ${JSON.stringify(response)}`
            );
          }
        } else {
          throw new Error(
            `error in response generation. Response: ${JSON.stringify(response)}`
          );
        }
      },
      defaultTimeout
    );

  if (Tests.test_chat_history_cache_rag)
    test(
      'Test endpoint with chat history, cache and RAG',
      async () => {
        // cache store
        const cacheStore = new InMemoryCacheStore({
          cacheQueryAfterThreshold: 2, // cache response first time query received
        });
        // define endpoint with chat history, cache and RAG
        const endpoint = defineChatEndpoint({
          endpoint: 'test-chat-open-chat-history-cache',
          enableChatHistory: true,
          chatHistoryStore: new InMemoryChatHistoryStore(),
          enableCache: true,
          cacheStore,
          enableRAG: true,
          topic: 'inventory data',
          retrieverConfig: {
            filePath: 'src/tests/test-data/inventory-data.csv',
            generateEmbeddings: true,
            retrievalOptions: {
              k: 10, // number of matching documents to retrieve. Didn't work well with the default value (4) for test data.
            },
          },
        });
        // ask the same query 2 times
        await runEndpoint(endpoint, {
          query: 'What is the price of Seagate ST1000DX002?',
        });
        await runEndpoint(endpoint, {
          query: 'What is the price of Seagate ST1000DX002?',
        });
        // ask the same query again
        // this time the response should be from cache
        const response = await runEndpoint(endpoint, {
          query: 'What is the price of Seagate ST1000DX002?',
        });
        expect(response).toBeDefined();

        // should not contain error
        if ('error' in response) {
          throw new Error(
            `Error in response. Response: ${JSON.stringify(response)}`
          );
        }

        // ------ Confirm Cache was used ------
        // method to check cache was used
        const atLeastOneCacheHit = (cache: CacheCollection) => {
          let flag = false;
          cache.forEach((val) => {
            if (val.cacheHits > 0) {
              flag = true;
            }
          });
          return flag;
        };
        // confirm cache was used
        expect(atLeastOneCacheHit(cacheStore.cache)).toBeTruthy();

        // ------ Confirm Chat History working ------
        // confirm chatId is returned
        if (!('chatId' in response)) {
          throw new Error(
            `No chatId returned in response. Response: ${JSON.stringify(response)}`
          );
        }

        // chatId to continue conversation
        const chatId = response.chatId;

        // response should be string when responseType not specified in endpoint config
        if (typeof response.response !== 'string') {
          throw new Error(
            `Invalid response object. Response: ${JSON.stringify(response)}`
          );
        }

        // response should not be empty
        expect(response.response.length).toBeGreaterThan(0);

        // ------ Confirm RAG is working ------
        // response should contain 68.06 (from inventory-data.csv)
        expect(response.response).toContain('68.06');

        // ask next query to continue conversation
        // no additional context is provided since it should come from chat history
        const secondResponse = await runEndpoint(endpoint, {
          query: 'How many of these do we have in stock?',
          chatId,
        });

        expect(secondResponse).toBeDefined();

        // should not contain error
        if ('error' in secondResponse) {
          throw new Error(
            `Error in response. Response: ${JSON.stringify(secondResponse)}`
          );
        }

        // ------ Confirm Chat History working ------
        // confirm chatId is returned
        if (!('chatId' in secondResponse)) {
          throw new Error(
            `No chatId returned in the second response. Response: ${JSON.stringify(secondResponse)}`
          );
        }
        // chat ID should be the same
        expect(secondResponse.chatId).toEqual(chatId);

        // response should be string when responseType not specified in endpoint config
        if (typeof secondResponse.response !== 'string') {
          throw new Error(
            `Invalid response object. Response: ${JSON.stringify(response)}`
          );
        }
        // response should not be empty
        expect(secondResponse.response.length).toBeGreaterThan(0);

        // ------ Confirm RAG is working ------
        // response should contain 88 (from inventory-data.csv)
        expect(secondResponse.response).toContain('88');
      },
      defaultTimeout
    );
});
