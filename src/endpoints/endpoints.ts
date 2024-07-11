import { z } from "zod";
import {
  ChatAgent,
  GenerateResponseHistoryProps,
  GenerateResponseProps,
} from "../agents/chat-agent";
import { defineFlow, runFlow } from "@genkit-ai/flow";
import { APIKeyStore } from "../auth/api-key-store";
import { CacheStore } from "../cache/cache-store";
import { generateHash, getChatHistoryAsString } from "../utils/utils";
import { MessageData } from "@genkit-ai/ai/model";
import { apiKeyAuthPolicy } from "../auth/api-key-auth-policy";
import {
  RetrieverConfig,
  TextDataRetriever,
} from "../rag/data-retrievers/data-retrievers";
import { getDataRetriever } from "../rag/data-retrievers/data-retrievers";
import { ChatHistoryStore } from "../history/chat-history-store";
import { Dotprompt } from "@genkit-ai/dotprompt";
import { ToolArgument } from "@genkit-ai/ai/tool";
import { ModelConfig, SupportedModels } from "../models/models";
import { getSystemPromptText } from "../prompts/system-prompts";

type ChatHistoryParams =
  | {
      enableChatHistory: true;
      chatHistoryStore: ChatHistoryStore;
    }
  | {
      enableChatHistory?: false;
    };

type AuthParams =
  | {
      enableAuth: true;
      apiKeyStore: APIKeyStore;
    }
  | {
      enableAuth?: false;
    };

type CacheParams =
  | {
      enableCache: true;
      cacheStore: CacheStore;
    }
  | {
      enableCache?: false;
    };

type RAGParams =
  | {
      enableRAG: true;
      topic: string;
      retrieverConfig: RetrieverConfig;
      agentType?: "close-ended";
    }
  | {
      enableRAG: true;
      topic: string;
      retriever: TextDataRetriever;
      agentType?: "close-ended";
    }
  | {
      enableRAG?: false;
    };

type ChatAgentTypeParams =
  | {
      agentType?: "open-ended";
    }
  | {
      agentType?: "close-ended";
      topic: string;
    };

type EndpointChatAgentConfig = {
  systemPrompt?: Dotprompt;
  chatPrompt?: Dotprompt;
  tools?: ToolArgument[];
  model?: SupportedModels;
  modelConfig?: ModelConfig;
};

export type DefineChatEndpointConfig = {
  endpoint: string;
  enableChatHistory?: boolean;
  chatAgentConfig?: EndpointChatAgentConfig;
} & ChatAgentTypeParams &
  ChatHistoryParams &
  AuthParams &
  CacheParams &
  RAGParams;

/**
 * Method to define a chat endpoint using the provided chat agent and endpoint, with support for chat history.
 * @param chatAgentConfig Configurations for the chat agent, like LLM model, system prompt, chat prompt, and tools.
 * @param endpoint Server endpoint to which queries should be sent to run this chat flow.
 * @param agentType Type of chat agent to use for this endpoint. Can be "open-ended" or "close-ended".
 * @param topic Topic for the close-ended or RAG chat agent. Required if agentType is "close-ended" or if RAG is enabled.
 * @param enableChatHistory Enable chat history for this endpoint. If chat ID is provided, chat history will be fetched and used to generate response. If no chat ID is provided, a new chat ID will be generated to store chat history, and will be returned in the response.
 * @param chatHistoryStore Chat History Store instance to use for this endpoint.
 * @param enableAuth Enable authentication for this endpoint. Must provide an API Key Store instance if set to true.
 * @param apiKeyStore API Key Store instance to use for this endpoint.
 * @param enableCache Enable caching for this endpoint. Must provide a Cache Store instance if set to true.
 * @param cacheStore Cache Store instance to use for this endpoint.
 * @param enableRAG Enable RAG (Retrieval Augmented Generation) functionality for this endpoint. Must provide a retriever method if set to true.
 * @param retriever Method to retrieve documents for RAG.
 * @param retrieverConfig Configuration for the RAG retriever.
 * @returns Object containing the response generated by the chat agent and the chat ID (if available), or an error message.
 */
export const defineChatEndpoint = (config: DefineChatEndpointConfig) =>
  defineFlow(
    {
      name: config.endpoint,
      inputSchema: z.object({
        query: z.string(),
        chatId: z.string().optional(),
        uid: config.enableAuth ? z.string() : z.string().optional(),
      }),
      outputSchema: config.enableChatHistory
        ? z.union([
            z.object({
              response: z.string(),
              chatId: z.string().optional(),
            }),
            z.object({
              error: z.string(),
            }),
          ])
        : z.union([
            z.string(),
            z.object({
              error: z.string(),
            }),
          ]),
      middleware: [
        (req, _, next) => {
          if (config.enableAuth) {
            const key = req.headers["authorization"];
            // add API key to the request object's auth property
            Object.assign(req, { auth: { key } });
          }
          next();
        },
      ],
      authPolicy: async (auth, input) => {
        if (config.enableAuth) {
          // check if auth object is valid
          if (!auth || !auth.key) throw new Error("Error: Invalid API key");

          // check if user ID is provided
          if (!input.uid) throw new Error("Error: User ID not provided");

          // Verify API key and user ID
          await apiKeyAuthPolicy({
            key: auth.key,
            uid: input.uid,
            endpoint: config.endpoint,
            apiKeyStore: config.apiKeyStore,
          });
        }
      },
    },
    async ({ query, chatId }) => {
      if (query === "") return { response: "How can I help you today?" };

      // store chat agent
      let chatAgent: ChatAgent;

      // Initialize chat agent based on the provided type
      if (!config.enableRAG) {
        // check if topic is provided
        if (config.agentType === "close-ended" && !config.topic) {
          throw new Error(
            "Error: Topic not provided for close-ended chat agent."
          );
        }

        // Initialize close-ended chat agent with the provided topic if close-ended agent
        // otherwise, initialize open-ended chat agent
        chatAgent =
          config.agentType === "close-ended"
            ? new ChatAgent({
                agentType: "close-ended",
                topic: config.topic,
                ...config.chatAgentConfig,
              })
            : new ChatAgent({
                agentType: "open-ended",
                ...config.chatAgentConfig,
              });
      }
      // If RAG is enabled
      else {
        // Initialize chat agent with RAG
        chatAgent = new ChatAgent({
          agentType: "rag",
          topic: config.topic,
          ...config.chatAgentConfig,
        });
      }

      // store query with context (includes the previous chat history if any, since that provides essential context)
      // will be used in caching and RAG, if enabled
      let queryWithContext = query;

      // store hash of the query for caching
      let queryHash: string = "";

      // store chat history for use in generating response later (avoids the need to fetch chat history again later)
      // only used if chat history is enabled and cache is enabled, otherwise is fetched from chat agent
      let history: MessageData[] | undefined;

      // variable to store if cache threshold has been reached for this query
      // used only if cache is enabled
      let cacheThresholdReached = false;

      // if chatId is provided, get chat history and add it to the query context
      if (config.enableChatHistory && chatId) {
        try {
          // try getting chat history for the given chat ID
          const chatHistory =
            await config.chatHistoryStore.getChatHistory(chatId);

          // add chat history to the query context
          queryWithContext += getChatHistoryAsString(chatHistory);
          // store chat history for use in generating response later
          history = chatHistory;
        } catch (error) {
          return {
            error:
              error instanceof Error
                ? error.message
                : `Error fetching chat history for chat ID: ${chatId}`,
          };
        }
      }

      // if code here, chat history is disabled OR chat history is enabled but chat ID is not provided
      // Don't generate new chat ID here, handled by the chat agent after response generation

      // If using cache and cache store is provided
      if (config.enableCache && config.cacheStore) {
        // Generate hash of the complete query to use as a key for the cache
        queryHash = generateHash(queryWithContext);

        // validate query hash
        if (!queryHash || queryHash === "")
          return {
            error: "Error: Invalid query. Could not generate hash.",
          };

        // If the query is cached, return the cached response
        try {
          // Check cache for the query
          const cachedQuery = await config.cacheStore.getRecord(queryHash);

          // check if cached response is available
          if (cachedQuery.response) {
            // increment cache hits
            config.cacheStore.incrementCacheHits(queryHash);

            // if chat history is enabled
            if (config.enableChatHistory) {
              // if chat ID is provided
              // add the query and response to the chat history for the provided chat ID
              if (chatId) {
                const messages: MessageData[] = [
                  { role: "user", content: [{ text: query }] },
                  { role: "model", content: [{ text: cachedQuery.response }] },
                ];
                // add messages to chat history for the provided chat ID
                // will throw an error if the provided chat ID is not valid
                await config.chatHistoryStore.addMessages(chatId, messages);
              }

              // if chat ID is not provided
              // store the chat history so the conversation can be continued
              else {
                // get system prompt text based on agent type
                const systemPrompt = getSystemPromptText(
                  config.agentType === "close-ended"
                    ? config.enableRAG
                      ? { agentType: "rag", topic: config.topic }
                      : { agentType: "close-ended", topic: config.topic }
                    : { agentType: "open-ended" }
                );
                // store the chat history so the conversation can be continued
                const messages: MessageData[] = [
                  { role: "system", content: [{ text: systemPrompt }] },
                  { role: "user", content: [{ text: query }] },
                  { role: "model", content: [{ text: cachedQuery.response }] },
                ];
                // add messages to chat history and get the chat ID
                chatId = await config.chatHistoryStore.addChatHistory(messages);
              }
            }

            // return the cached response with the chat ID
            return config.enableChatHistory
              ? { response: cachedQuery.response, chatId }
              : cachedQuery.response;
          }

          // if response is not available, but query is in cache
          // means the cacheThreshold amount hasn't yet reached 0
          // decrement cacheThreshold to record another request for this query
          // if this decrement causes the cacheThreshold to reach 0, the query response will be cached this time
          config.cacheStore.decrementCacheThreshold(queryHash);

          // check if cacheThreshold has reached 0
          if (cachedQuery.cacheThreshold - 1 === 0) {
            // if cacheThreshold reaches 0, cache the response
            cacheThresholdReached = true;
          }
        } catch (error) {
          // if query is not in cache, add it to cache to track the number of times this query is received
          // sending hash is optional. Sending so hash doesn't have to be recalculated
          // remeber to add the query with context
          config.cacheStore.addQuery(queryWithContext, queryHash);
        }
      }

      try {
        // variable to store context, in case RAG is enabled
        let context: string | undefined;

        // If RAG enabled
        if (config.enableRAG) {
          // if retriever not provided, check if retrieverConfig is provided
          if (!("retriever" in config)) {
            // if retrieverConfig not provided, return an error
            if (!config.retrieverConfig) {
              return {
                error:
                  "Error: To enable RAG you must provide either retriever or retriever config.",
              };
            }
            // get retriever using the provided configuration
            const retriever = await getDataRetriever(config.retrieverConfig);
            // get context using the retriever
            context = await retriever.invoke(query);
          } else {
            // get context using the retriever
            context = await config.retriever.invoke(query);
          }
        }

        // Prepare query for generating response
        let queryWithParams: GenerateResponseProps = {
          query,
          context,
        };

        // If chat history is enabled
        if (config.enableChatHistory) {
          // Prepare history props for generating response
          const historyProps: GenerateResponseHistoryProps = {
            enableChatHistory: config.enableChatHistory,
            chatId: chatId,
            history: history,
            chatHistoryStore: config.chatHistoryStore,
          };
          // Add history props to the query
          queryWithParams = { ...queryWithParams, ...historyProps };
        }

        // Generate a response using the chat agent
        const response = await chatAgent.generateResponse(queryWithParams);

        // If using cache and cache store is provided, and
        // if cacheThreshold reaches 0 for this query, cache the response
        if (config.enableCache && config.cacheStore && cacheThresholdReached) {
          config.cacheStore.cacheResponse(queryHash, response.res.text());
        }

        return config.enableChatHistory
          ? {
              response: response.res.text(),
              chatId: response.chatId,
            }
          : response.res.text();
      } catch (error) {
        return {
          error: `Error: ${error}`,
        };
      }
    }
  );

/**
 * Get method to run the chat endpoint flow.
 * @returns Method to run the chat endpoint flow.
 */
export const getChatEndpointRunner = () => runFlow;
