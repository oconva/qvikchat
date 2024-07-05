import { ChatAgent } from "./src/agents/chat-agent";
import { InMemoryAPIKeyStore } from "./src/auth/in-memory-api-key-store";
import { InMemoryCacheStore } from "./src/cache/in-memory-cache-store";
import { ENDPOINTS } from "./src/config";
import { defineChatFlow } from "./src/flows/flow";
import { InMemoryChatHistoryStore } from "./src/history/in-memory-chat-history-store";
import { getDataRetriever } from "./src/rag/retrievers/data-retriever";
import { generateAlphaNumericString } from "./src/utils/utils";

// Function to define test flows
export const defineTestFlows = async () => {
  // Open-ended chat flow
  defineChatFlow({
    chatAgent: new ChatAgent(),
    endpoint: ENDPOINTS.CHAT.OPEN_ENDED,
  });
  // Open-ended chat flow with support for chat history
  defineChatFlow({
    endpoint: ENDPOINTS.CHAT.OPEN_ENDED_WITH_HISTORY,
    enableChatHistory: true,
    chatHistoryStore: new InMemoryChatHistoryStore(),
  });

  // Close-ended chat flow (will only answer queries related to specified topic, in this case, 'Firebase')
  defineChatFlow({
    chatAgent: new ChatAgent({
      agentType: "close-ended",
      topic: "Firebase",
    }),
    endpoint: ENDPOINTS.CHAT.CLOSE_ENDED,
  });
  // Close-ended chat flow with support for chat history
  defineChatFlow({
    endpoint: ENDPOINTS.CHAT.CLOSE_ENDED_WITH_HISTORY,
    agentType: "close-ended",
    topic: "Firebase",
    enableChatHistory: true,
    chatHistoryStore: new InMemoryChatHistoryStore(),
  });

  // Below are examples of flows that support authentication using API keys and support response caching

  // Initialize API key store
  const testAPIKeyStore = new InMemoryAPIKeyStore();
  // add a test API key
  const key = generateAlphaNumericString();
  testAPIKeyStore.addKey(key, {
    uid: "test-user",
    status: "active",
    endpoints: "all", // allow access to all endpoints
  });
  console.log("\nTest API Key");
  console.dir(testAPIKeyStore);

  // Open-ended chat flow with support for chat history, authentication, and caching
  defineChatFlow({
    endpoint: ENDPOINTS.CHAT.OPEN_ENDED_HISTORY_AUTH_CACHED,
    enableChatHistory: true,
    chatHistoryStore: new InMemoryChatHistoryStore(),
    enableAuth: true,
    apiKeyStore: testAPIKeyStore,
    enableCache: true,
    cacheStore: new InMemoryCacheStore(),
  });

  // Close-ended chat flow with support for chat history, authentication, and caching
  defineChatFlow({
    agentType: "close-ended",
    topic: "Firebase",
    endpoint: ENDPOINTS.CHAT.CLOSE_ENDED_HISTORY_AUTH_CACHED,
    enableChatHistory: true,
    chatHistoryStore: new InMemoryChatHistoryStore(),
    enableAuth: true,
    apiKeyStore: testAPIKeyStore,
    enableCache: true,
    cacheStore: new InMemoryCacheStore(),
  });

  // Index inventory data and get retriever
  const inventoryDataRetriever = await getDataRetriever({
    dataType: "csv",
    filePath: "lib/rag/knowledge-base/test-data/inventory-data.csv",
    generateEmbeddings: true,
  });

  // Inventory Data chat flow with support for chat history, authentication, caching and RAG
  defineChatFlow({
    endpoint: ENDPOINTS.CHAT.RAG_HISTORY_AUTH_CACHED + "-inventory",
    enableChatHistory: true,
    chatHistoryStore: new InMemoryChatHistoryStore(),
    enableAuth: true,
    apiKeyStore: testAPIKeyStore,
    enableCache: true,
    cacheStore: new InMemoryCacheStore(),
    enableRAG: true,
    retriever: inventoryDataRetriever,
  });
};
