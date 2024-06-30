# Genko - Genkit Starter Kit

Develop a production-ready AI-powered app or service at a rapid pace with this [Firebase Genkit](https://github.com/firebase/genkit) based project starter kit. **Genko** is a starter kit that provides you with a solid foundation to build powerful AI-powered chat agents quickly and efficiently. It includes support for chat agents, chat history, caching, authentication, and information retrieval using Retrieval Augmented Generation (RAG).

> [!NOTE]
> This is not an official Firebase Genkit starter kit. This is a community-supported project. Firebase Genkit is currently in beta, this means that the public API and framework design may change in backward-incompatible ways.

If you find value from this project, please consider contributing or sponsoring the project to help maintain and improve it. All contributions and support are greatly appreciated!

[![](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/pranav-kural)

## Features

-   **Firebase Genkit**: Built using the open source [Firebase Genkit framework](https://firebase.google.com/docs/genkit) to help you build powerful production-ready AI-powered apps or services quickly and efficiently.
-   **Deploy to any NodeJS platform**: Deploy your app or service to any NodeJS platform, including Firebase, Google Cloud, AWS, Heroku, etc.
-   **Chat agents**: Create chat agents with support for chat history, caching, authentication and information retrieval, in a few lines of code.
-   **API key protected endpoints**: API Key Store to easily manage API keys and ensure that only authorized users can access your app endpoints.
-   **Response Caching**: Cache responses to user queries to improve response times and reduce the number of API calls to LLM.
-   **RAG Agents**: Create chat agents that can use Retrieval Augmented Generation (RAG) to answer user queries by retrieving additional context information (e.g. from a text or JSON file).
-   **RAG Data Loading**: Built-in support for loading text, JSON or code files. Easily add new knowledge bases to create new RAG agents.
-   **System Prompts**: Use system prompts to ensure safety, accuracy, and reliability. Mitigate LLM hallucination and deter prompt injection attacks.
-   **Dotprompt**: Using Dotprompt for well-structured prompts with all relevant metadata and input-output data validation.
-   **Fast Build Time**: [SWC](https://swc.rs/) for ultra-fast TypeScript compilation.

## Notes

This is a starter kit. Its meant to give you a starting point so you can quickly get started with building your chat app or service using Genkit, eliminating the need for you to deal with setting up the whole project from scratch.

This means that this starter kit is not exhaustive, and you may add more features, chat agent types, cloud-based database support, etc. as you see fit.

By default, the starter kit uses in-memory data stores for API Key Store, Cache Store, Vector store (for RAG), and Chat History Store. This means you won't have to setup anything prior to being able to use these, however, these may not be ideal for a production app. You can easily replace these by implementing the appropriate interface for your own data stores. For instance, you can easily use Firestore as your API Key Store by implementing the `APIKeyStore` interface in `src/auth/api-key-store.ts`, and providing that to your chat flow as the `apiKeyStore`.

## Table of Contents

- [Genko - Genkit Starter Kit](#genko---genkit-starter-kit)
  - [Features](#features)
  - [Notes](#notes)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Genkit Developer UI](#genkit-developer-ui)
  - [Usage](#usage)
    - [Open Chat](#open-chat)
    - [Open Chat with History](#open-chat-with-history)
    - [Open Chat with Chat History, Caching, and Authentication](#open-chat-with-chat-history-caching-and-authentication)
    - [Close Chat](#close-chat)
    - [Close Chat with History](#close-chat-with-history)
    - [Close Chat with Chat History, Caching, and Authentication](#close-chat-with-chat-history-caching-and-authentication)
    - [RAG (Retrieval Augmented Generation) Chat](#rag-retrieval-augmented-generation-chat)
  - [Chat Agents](#chat-agents)
  - [Chat History Storage](#chat-history-storage)
  - [API Key Store](#api-key-store)
  - [Cache Store](#cache-store)
  - [Prompts](#prompts)
  - [Contributions](#contributions)
  - [License](#license)
  - [Issues](#issues)

## Getting Started

1.  Clone this repository.

    ```bash
    git clone https://github.com/pranav-kural/genkit-starter-kit.git
    ```

2.  Install dependencies.

    ```bash
    npm install
    ```

    Or

    ```bash
    pnpm add
    ```

3.  Add you Google AI API key in the `.env` file.

    ```bash
    GOOGLE_GENAI_API_KEY=<your GOOGLE_GENAI_API_KEY>
    ```

4.  Compile the TypeScript code. You can modify `.swcrc` to change the SWC configurations and `package.json` to adjust the build command.

    ```bash
    npm run build
    ```

    Or

    ```bash
    pnpm build
    ```

5.  Start the server.

    ```bash
    npm start
    ```

    Or

    ```bash
    pnpm start
    ```

## Genkit Developer UI

You could also start the Genkit Developer UI instead of running the server above, using the following command:

```bash
genkit start
```

OR (if you haven't installed Genkit CLI globally)

```bash
npx genkit start
```

For more information on how to install the Firebase Genkit CLI, please check the [Genkit CLI documentation](https://firebase.google.com/docs/genkit/get-started).

## Usage

If running the server, you can test the pre-defined flows using the commands below:

### Open Chat

Unrestricted chat with no chat history support.

**Expected input schema**

-   `data`: User query to chat agent.

    ```json
    {
    	"data": "string",
    	"required": ["data"]
    }
    ```

**Output schema**

For successful requests, the response will contain:

-   `result`: Chat agent response to the user query, returned as a string by default. (You may add more flows or update existing ones under `src/flows`)

        ```json
        {
            "result": "string"
        }
        ```

For failed requests, the response will contain:

-   `error`: Error message returned by the server.

        ```json
        {
            "error": "string"
        }
        ```

**Example**

Check `src/index.ts` to see how you can define an open-ended chat flow.

```typescript
import { defineChatFlow } from './flows/flow';

// Open-ended chat flow
defineChatFlow({
	chatAgent: new ChatAgent(),
	endpoint: ENDPOINTS.CHAT.OPEN_ENDED,
});
```

Can use commands below to test this flow.

Depending on the model being used, you may notice that the LLM will hallucinate the answer to the second question. This is because we aren't providing the context in which we are asking the question and because there is no conversation history to refer to.

```bash
curl -X POST "http://127.0.0.1:3400/chat-open" -H "Content-Type: application/json"  -d '{"data": "Answer in one sentence: What is Firebase Firestore?" }'

curl -X POST "http://127.0.0.1:3400/chat-open" -H "Content-Type: application/json"  -d '{"data": "Can it be used for authentication?" }'
```

### Open Chat with History

Unresticted chat with chat history support. By default uses in-memory chat history store (`src/data/chat-history-store.ts`).

**Expected input schema**

-   `query`: User query to chat agent.
-   `chatId`: Optional chat ID to continue the chat history. If not provided, a new chat history will be created, and the chat ID for this chat history will be returned with the response. This chat ID can be sent in further requests to continue a specific conversation. If the provided chat ID is not valid or not found, as error is returned.

    ```json
    {
    	"data": {
    		"query": "string",
    		"chatId": "string"
    	},
    	"required": ["query"]
    }
    ```

**Output schema**

For successful requests, the response will contain:

-   `response`: Chat agent response to the user query, returned as a string by default. (You may add more flows or update existing ones under `src/flows`)
-   `chatId`: Chat ID for the current chat history. This can be used to continue the chat history in further requests.

        ```json
        {
            "result": {
                "response": "string",
                "chatId": "string"
            }
        }
        ```

For failed requests, the response will contain:

-   `error`: Error message returned by the server.

        ```json
        {
            "error": "string"
        }
        ```

**Example**

Check `src/index.ts` to see how you can define an open-ended chat flow that supports chat history.

```typescript
import { defineChatFlow } from './flows/flow';

// Open-ended chat flow with support for chat history
defineChatFlow({
	chatAgent: new ChatAgent({
		useChatHistory: true,
	}),
	endpoint: ENDPOINTS.CHAT.OPEN_ENDED_WITH_HISTORY,
});
```

Can use commands below to test this flow.

On running the first example, you should receive an object as a response with the chat ID for the chat history. Add this chat ID to the second example to continue the chat history.

```bash
curl -X POST "http://127.0.0.1:3400/chat-open-history" -H "Content-Type: application/json"  -d '{"data": { "query": "Answer in one sentence: What is Firebase Firestore?" } }'

curl -X POST "http://127.0.0.1:3400/chat-open-history" -H "Content-Type: application/json"  -d '{"data": {"query": "Can it be used for authentication?", "chatId": "<enter chat id here>"} }'
```

### Open Chat with Chat History, Caching, and Authentication

Unrestricted chat with chat history support, response caching, and API key authentication.

**Expected input schema**

Request header requires an API key for authentication:

-   `key`: API key for authentication. The API key must be owned by the user making the request, and should have authorization to access the flow endpoint.

Request body data:

-   `query`: User query to chat agent.
-   `uid`: User ID of the user making the query. Required to assess if user is authorized to access the flow endpoint. The API key provided in headers must be owned by this user.
-   `chatId`: Optional chat ID to continue the chat history. If not provided, a new chat history will be created, and the chat ID for this chat history will be returned with the response. This chat ID can be sent in further requests to continue a specific conversation. If the provided chat ID is not valid or not found, as error is returned.

    ```json
    {
    	"data": {
    		"query": "string",
    		"uid": "string",
    		"chatId": "string"
    	},
    	"required": ["query", "uid"]
    }
    ```

**Output schema**

For successful requests, the response will contain:

-   `response`: Chat agent response to the user query, returned as a string by default. (You may add more flows or update existing ones under `src/flows`)
-   `chatId`: Chat ID for the current chat history. This can be used to continue the chat history in further requests.

        ```json
        {
            "result": {
                "response": "string",
                "chatId": "string"
            }
        }
        ```

For failed requests, the response will contain:

-   `error`: Error message returned by the server.

        ```json
        {
            "error": "string"
        }
        ```

**Example**

Check `src/index.ts` to see how you can define an open-ended chat flow that supports chat history, response caching, and API key authentication.

```typescript
import { defineChatFlow } from './flows/flow';

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
```

Can use commands below to test this flow.

On running the first example, you should receive an object as a response with the chat ID for the chat history. Add this chat ID to the second example to continue the chat history.

```bash
curl -X POST "http://127.0.0.1:3400/chat-open-history-auth-cached" -H "Content-Type: application/json" -H "Authorization: YOUR_API_KEY" -d '{"data": { "query": "Answer in one sentence: What is Firebase Firestore?" } }'

curl -X POST "http://127.0.0.1:3400/chat-open-history-auth-cached" -H "Content-Type: application/json" -H "Authorization: YOUR_API_KEY" -d '{"data": {"query": "Can it be used for authentication?", "chatId": "<enter chat id here>"} }'
```

### Close Chat

Restricted chat to a specific topic with no chat history support.

**Expected input schema**

-   `data`: User query to chat agent.

    ```json
    {
    	"data": "string",
    	"required": ["data"]
    }
    ```

**Output schema**

For successful requests, the response will contain:

-   `result`: Chat agent response to the user query, returned as a string by default. (You may add more flows or update existing ones under `src/flows`)

        ```json
        {
            "result": "string"
        }
        ```

For failed requests, the response will contain:

-   `error`: Error message returned by the server.

        ```json
        {
            "error": "string"
        }
        ```

**Example**

Check `src/index.ts` to see how you can define a close-ended chat flow.

```typescript
import { defineChatFlow } from './flows/flow';

// Close-ended chat flow (will only answer queries related to specified topic, in this case, 'Firebase')
defineChatFlow(
	new ChatAgent({
		agentTypeConfig: {
			agentType: 'close-ended',
			topic: 'Firebase',
		},
	}),
	'closeChat'
);
```

Can use commands below to test this flow.

For the first example, ideally, you should get a response that the model can't answer the question since it's not related to the specified topic, establishing that the chat agent is working as expected. It should, however, generate a proper answer for the second example.

```bash
curl -X POST "http://127.0.0.1:3400/chat-close" -H "Content-Type: application/json"  -d '{"data": "Can you help me with my calculus assignment?" }'

// no need to provide context that this is related to firebase (since the chat agent is restricted already to firebase related topics)
curl -X POST "http://127.0.0.1:3400/chat-close" -H "Content-Type: application/json"  -d '{"data": "What is App check?" }'
```

### Close Chat with History

Restricted chat to a specific topic with chat history support.

**Expected input schema**

-   `query`: User query to chat agent.
-   `chatId`: Optional chat ID to continue the chat history. If not provided, a new chat history will be created, and the chat ID for this chat history will be returned with the response. This chat ID can be sent in further requests to continue a specific conversation. If the provided chat ID is not valid or not found, as error is returned.

    ```json
    {
    	"data": {
    		"query": "string",
    		"chatId": "string"
    	},
    	"required": ["query"]
    }
    ```

**Output schema**

For successful requests, the response will contain:

-   `response`: Chat agent response to the user query, returned as a string by default. (You may add more flows or update existing ones under `src/flows`)
-   `chatId`: Chat ID for the current chat history. This can be used to continue the chat history in further requests.

            ```json
            {
                "result": {
                    "response": "string",
                    "chatId": "string"
                }
            }
            ```

For failed requests, the response will contain:

-   `error`: Error message returned by the server.

        ```json
        {
            "error": "string"
        }
        ```

**Example**

Check `src/index.ts` to see how you can define a close-ended chat flow that supports chat history.

```typescript
import { defineChatFlow } from './flows/flow';

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
```

```bash
curl -X POST "http://127.0.0.1:3400/chat-close-history" -H "Content-Type: application/json"  -d '{"data": { "query": "What is App check?" } }'

curl -X POST "http://127.0.0.1:3400/chat-close-history" -H "Content-Type: application/json"  -d '{"data": { "query": "By using this, can you block traffic that does not have valid credentials?", "chatId": "<enter chat id here>" } }'
```

### Close Chat with Chat History, Caching, and Authentication

Restricted chat to a specific topic with chat history support, response caching, and API key authentication.

**Expected input schema**

Request header requires an API key for authentication:

-   `key`: API key for authentication. The API key must be owned by the user making the request, and should have authorization to access the flow endpoint.

Request body data:

-   `query`: User query to chat agent.
-   `uid`: User ID of the user making the query. Required to assess if user is authorized to access the flow endpoint. The API key provided in headers must be owned by this user.
-   `chatId`: Optional chat ID to continue the chat history. If not provided, a new chat history will be created, and the chat ID for this chat history will be returned with the response. This chat ID can be sent in further requests to continue a specific conversation. If the provided chat ID is not valid or not found, as error is returned.

    ```json
    {
    	"data": {
    		"query": "string",
    		"uid": "string",
    		"chatId": "string"
    	},
    	"required": ["query", "uid"]
    }
    ```

**Output schema**

For successful requests, the response will contain:

-   `response`: Chat agent response to the user query, returned as a string by default. (You may add more flows or update existing ones under `src/flows`)
-   `chatId`: Chat ID for the current chat history. This can be used to continue the chat history in further requests.

            ```json
            {
                "result": {
                    "response": "string",
                    "chatId": "string"
                }
            }
            ```

For failed requests, the response will contain:

-   `error`: Error message returned by the server.

        ```json
        {
            "error": "string"
        }
        ```

**Example**

Check `src/index.ts` to see how you can define a close-ended chat flow that supports chat history, response caching, and API key authentication.

```typescript
import { defineChatFlow } from './flows/flow';

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
```

You can use the commands below to test this flow.

On running the first example, you should receive an object as a response with the chat ID for the chat history. Add this chat ID to the second example to continue the chat history.

```bash
curl -X POST "http://127.0.0.1:3400/chat-close-history-auth-cached" -H "Content-Type: application/json" -H "Authorization: YOUR_API_KEY" -d '{"data": { "query": "What is App check?" } }'

curl -X POST "http://127.0.0.1:3400/chat-close-history-auth-cached" -H "Content-Type: application/json" -H "Authorization: YOUR_API_KEY" -d '{"data": { "query": "By using this, can you block traffic that does not have valid credentials?", "chatId": "<enter chat id here>" } }'
```

### RAG (Retrieval Augmented Generation) Chat

Restricted chat to a specific topic with chat history support, response caching, and API key authentication. Uses RAG to answer user queries by retrieving additional context information (e.g. from a text or JSON file).

**Expected input schema**

Request header requires an API key for authentication:

-   `key`: API key for authentication. The API key must be owned by the user making the request, and should have authorization to access the flow endpoint.

Request body data:

-   `query`: User query to chat agent.
-   `uid`: User ID of the user making the query. Required to assess if user is authorized to access the flow endpoint. The API key provided in headers must be owned by this user.
-   `chatId`: Optional chat ID to continue the chat history. If not provided, a new chat history will be created, and the chat ID for this chat history will be returned with the response. This chat ID can be sent in further requests to continue a specific conversation. If the provided chat ID is not valid or not found, as error is returned.

    ```json
    {
    	"data": {
    		"query": "string",
    		"uid": "string",
    		"chatId": "string"
    	},
    	"required": ["query", "uid"]
    }
    ```

**Output schema**

For successful requests, the response will contain:

-   `response`: Chat agent response to the user query, returned as a string by default. (You may add more flows or update existing ones under `src/flows`)
-   `chatId`: Chat ID for the current chat history. This can be used to continue the chat history in further requests.

            ```json
            {
                "result": {
                    "response": "string",
                    "chatId": "string"
                }
            }
            ```

For failed requests, the response will contain:

-   `error`: Error message returned by the server.

        ```json
        {
            "error": "string"
        }
        ```

**Example**

Check `src/index.ts` to see how you can define a RAG chat flow that supports chat history, response caching, and API key authentication.

Below example uses a RAG agent to answer user queries related to 'Store Inventory Data'. The sample inventory data is stored in `rag/knowledge-bases/test-retail-store-kb/inventory-data.csv` in CSV format. We'll index this data, store it in a vector store, and use a vector store retriever to retrieve the data when answering user queries.

```typescript
import { defineChatFlow } from './flows/flow';

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
```

You can use the commands below to test this flow.

On running the first example, you should receive an object as a response with the chat ID for the chat history. Add this chat ID to the second example to continue the chat history.

```bash
curl -X POST "http://127.0.0.1:3400/chat-rag-history-auth-cached" -H "Content-Type: application/json" -H "Authorization: YOUR_API_KEY" -d '{"data": { "query": "What is the price of Seagate ST1000DX002?" } }'

curl -X POST "http://127.0.0.1:3400/chat-rag-history-auth-cached" -H "Content-Type: application/json" -H "Authorization: YOUR_API_KEY" -d '{"data": { "query": "Could you also let me know about its capacity?", "chatId": "<enter chat id here>" } }'
```

## Chat Agents

## Chat History Storage

By default, the starter kit uses an in-memory chat history store (`src/data/in-memory-chat-history-store.ts`). This store is used to store chat histories for the chat agents that support chat history. You can replace this in-memory store with a cloud-based database of your choice (e.g. Firestore) by implementing the `ChatHistoryStore` interface in `src/data/chat-history-store.ts`.

## API Key Store

By default, the starter kit uses an in-memory API key store (`src/auth/in-memory-api-key-store.ts`). This store is used to store API keys for authentication. You can replace this in-memory store with a cloud-based database of your choice (e.g. Firestore) by implementing the `APIKeyStore` interface in `src/auth/api-key-store.ts`.

## Cache Store

By default, the starter kit uses an in-memory cache store (`src/cache/in-memory-cache-store.ts`). This store is used to cache responses to user queries to improve response times and reduce the number of API calls to LLM. You can replace this in-memory store with a cloud-based database of your choice (e.g. Firestore) by implementing the `CacheStore` interface in `src/cache/cache-store.ts`.

## Prompts

The starter kit uses [Dotprompt](https://firebase.google.com/docs/genkit/dotprompt.md) to define system and chat prompts. These prompts ensure safety, accuracy, and reliability. They are designed to mitigate LLM hallucination and deter prompt injection attacks.

Prompts can be found in `src/prompts`. While system prompts are used for setting up the behavior of the chat agent, chat prompts are used for continued user queries which are part of an ongoing conversation. These chat prompts may include chat history, additional context information, etc.

## Contributions

Contributions are welcome! Please refer to the [contribution guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues

If you encounter any issues or bugs while using the starter kit, please report them by following these steps:

1. Check if the issue has already been reported by searching our issue tracker.
2. If the issue hasn't been reported, create a new issue and provide a detailed description of the problem.
3. Include steps to reproduce the issue and any relevant error messages or screenshots.

[Open Issue](https://github.com/pranav-kural/genko/issues)
