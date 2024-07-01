import { ChatAgent } from './src/agents/chat-agent';
import { InMemoryAPIKeyStore } from './src/auth/in-memory-api-key-store';
import { InMemoryCacheStore } from './src/cache/in-memory-cache-store';
import { ENDPOINTS, GLOBAL_CONFIG } from './src/config';
import { defineChatFlow } from './src/flows/flow';
import { getDataRetriever } from './src/rag/retrievers/data-retriever';
import { generateAlphaNumericString } from './src/utils/utils';

// Function to define test flows
export const defineTestFlows = () => {
	// Open-ended chat flow
	defineChatFlow({
		chatAgent: new ChatAgent(),
		endpoint: ENDPOINTS.CHAT.OPEN_ENDED,
	});
	// Open-ended chat flow with support for chat history
	defineChatFlow({
		chatAgent: new ChatAgent({
			useChatHistory: true,
		}),
		endpoint: ENDPOINTS.CHAT.OPEN_ENDED_WITH_HISTORY,
	});

	// Close-ended chat flow (will only answer queries related to specified topic, in this case, 'Firebase')
	defineChatFlow({
		chatAgent: new ChatAgent({
			agentTypeConfig: {
				agentType: 'close-ended',
				topic: 'Firebase',
			},
		}),
		endpoint: ENDPOINTS.CHAT.CLOSE_ENDED,
	});
	// Close-ended chat flow with support for chat history
	defineChatFlow({
		chatAgent: new ChatAgent({
			agentTypeConfig: {
				agentType: 'close-ended',
				topic: 'Firebase',
			},
			useChatHistory: true,
		}),
		endpoint: ENDPOINTS.CHAT.CLOSE_ENDED_WITH_HISTORY,
	});

	// Below are examples of flows that support authentication using API keys and support response caching

	// Initialize API key store
	const apiKeyStore = new InMemoryAPIKeyStore();
	// add a test API key
	const key = generateAlphaNumericString();
	apiKeyStore.addKey(key, {
		uid: 'test-user',
		status: 'active',
		endpoints: 'all', // allow access to all endpoints
	});
	console.log('\nTest API Key');
	console.dir(apiKeyStore);

	// Define a cache store
	const cacheStore = new InMemoryCacheStore(GLOBAL_CONFIG.cacheStoreConfig);

	// Open-ended chat flow with support for chat history, authentication, and caching
	defineChatFlow({
		chatAgent: new ChatAgent({
			useChatHistory: true,
		}),
		endpoint: ENDPOINTS.CHAT.OPEN_ENDED_HISTORY_AUTH_CACHED,
		config: {
			enableChatHistory: true,
			enableAuth: true,
			apiKeyStore,
			enableCache: true,
			cacheStore,
			enableRAG: false,
		},
	});

	// Close-ended chat flow with support for chat history, authentication, and caching
	defineChatFlow({
		chatAgent: new ChatAgent({
			agentTypeConfig: {
				agentType: 'close-ended',
				topic: 'Firebase',
			},
			useChatHistory: true,
		}),
		endpoint: ENDPOINTS.CHAT.CLOSE_ENDED_HISTORY_AUTH_CACHED,
		config: {
			enableChatHistory: true,
			enableAuth: true,
			apiKeyStore,
			enableCache: true,
			cacheStore,
			enableRAG: false,
		},
	});

	/**
	 * Function to define RAG chat flow for inventory data
	 * Uses the test data available at (`rag/knowledge-bases`)
	 * to define RAG chat flows for inventory data and return policy
	 */
	const defineTestRAGFlows = async () => {
		// Index inventory data and get retriever
		const inventoryDataRetriever = await getDataRetriever({
			dataType: 'csv',
			filePath:
				'lib/rag/knowledge-bases/test-retail-store-kb/inventory-data.csv',
			generateEmbeddings: true,
		});

		// Inventory Data chat flow with support for chat history, authentication, caching and RAG
		defineChatFlow({
			chatAgent: new ChatAgent({
				agentTypeConfig: {
					agentType: 'rag',
					topic: 'Store Inventory Data',
				},
				useChatHistory: true,
			}),
			endpoint: ENDPOINTS.CHAT.RAG_HISTORY_AUTH_CACHED + '-inventory',
			config: {
				enableChatHistory: true,
				enableAuth: true,
				apiKeyStore,
				enableCache: true,
				cacheStore,
				enableRAG: true,
				retriever: inventoryDataRetriever,
			},
		});
	};
	defineTestRAGFlows();
};
