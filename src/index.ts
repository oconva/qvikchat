import dotenv from 'dotenv';
import { configureGenkit } from '@genkit-ai/core';
import { startFlowsServer } from '@genkit-ai/flow';
import { googleAI } from '@genkit-ai/googleai';
import { dotprompt } from '@genkit-ai/dotprompt';
import { ENDPOINTS, GLOBAL_CONFIG } from './config';
import { ChatAgent } from './agents/chat-agent';
import { InMemoryAPIKeyStore } from './auth/in-memory-api-key-store';
import { generateAlphaNumericString } from './utils/utils';
import { defineChatFlow } from './flows/flow';
import { InMemoryCacheStore } from './cache/in-memory-cache-store';
import { getInventoryDataRetriever } from './rag/retrievers/inventory-data-retriever';
import { langchain } from 'genkitx-langchain';
import { getReturnPolicyRetriever } from './rag/retrievers/return-policy-retriever';

// Load environment variables
dotenv.config();

// Configure Genkit
configureGenkit({
	plugins: [
		googleAI({
			apiKey: process.env.GOOGLE_GENAI_API_KEY,
		}),
		dotprompt(),
		langchain({}),
	],
	logLevel: GLOBAL_CONFIG.genkitConfig?.logLevel || 'warn',
	enableTracingAndMetrics: true,
});

// Define the chat flows

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
	enableChatHistory: true,
	enableAuth: true,
	apiKeyStore,
	enableCache: true,
	cacheStore,
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
	enableChatHistory: true,
	enableAuth: true,
	apiKeyStore,
	enableCache: true,
	cacheStore,
});

/**
 * Function to define test RAG flows
 * Uses the test data available at (`rag/knowledge-bases`)
 * to define RAG chat flows for inventory data and return policy
 */
const defineTestRAGFlows = async () => {
	// Index inventory data and get retriever
	const inventoryDataRetriever = await getInventoryDataRetriever();

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
		enableChatHistory: true,
		enableAuth: true,
		apiKeyStore,
		enableCache: true,
		cacheStore,
		enableRAG: true,
		retriever: inventoryDataRetriever,
	});

	// Index return policy data and get retriever
	const returnPolicyRetriever = await getReturnPolicyRetriever();

	// Return Policy chat flow with support for chat history, authentication, caching and RAG
	defineChatFlow({
		chatAgent: new ChatAgent({
			agentTypeConfig: {
				agentType: 'rag',
				topic: 'Store Retail Policy',
			},
			useChatHistory: true,
		}),
		endpoint: ENDPOINTS.CHAT.RAG_HISTORY_AUTH_CACHED + '-return-policy',
		enableChatHistory: true,
		enableAuth: true,
		apiKeyStore,
		enableCache: true,
		cacheStore,
		enableRAG: true,
		retriever: returnPolicyRetriever,
	});
};

defineTestRAGFlows();

// Start the flows server with global configurations
startFlowsServer(GLOBAL_CONFIG.startFlowsServerParams);
