import {z} from 'zod';
import {
  GenerateRequest,
  GenerationUsage,
  MessageData,
  ToolRequestPart,
} from '@genkit-ai/ai/model';
import type {Dotprompt} from '@genkit-ai/dotprompt';
import type {ToolArgument} from '@genkit-ai/ai/tool';
import {defineFlow, runFlow} from '@genkit-ai/flow';
import {
  ChatAgent,
  type GenerateResponseHistoryProps,
  type GenerateResponseProps,
} from '../agents/chat-agent';
import type {APIKeyStore} from '../auth/api-key-store';
import type {CacheStore} from '../cache/cache-store';
import type {ChatHistoryStore} from '../history/chat-history-store';
import {generateHash, getChatHistoryAsString} from '../utils/utils';
import {apiKeyAuthPolicy} from '../auth/api-key-auth-policy';
import type {
  RetrieverConfig,
  TextDataRetriever,
} from '../rag/data-retrievers/data-retrievers';
import {getDataRetriever} from '../rag/data-retrievers/data-retrievers';
import {
  type ModelConfig,
  type OutputSchemaType,
  OutputSchema,
} from '../models/models';
import {getSystemPromptText} from '../prompts/system-prompts';

/**
 * Type definition for the chat history parameters.
 *
 * @typedef {Object} ChatHistoryParams - Type parameters for chat history.
 *
 * @property {boolean} [enableChatHistory] - Enable chat history for this endpoint. If chat ID is provided, chat history will be fetched and used to generate response. If no chat ID is provided, a new chat ID will be generated to store chat history, and will be returned in the response.
 * @property {ChatHistoryStore} [chatHistoryStore] - Chat History Store instance to use for this endpoint.
 */
type ChatHistoryParams =
  | {
      enableChatHistory: true;
      chatHistoryStore: ChatHistoryStore;
    }
  | {
      enableChatHistory?: false;
    };

/**
 * Type definition for the authentication parameters.
 *
 * @typedef {Object} AuthParams - Type parameters for authentication.
 *
 * @property {boolean} [enableAuth] - Enable authentication for this endpoint. Must provide an API Key Store instance if set to true.
 * @property {APIKeyStore} [apiKeyStore] - API Key Store instance to use for this endpoint.
 */
type AuthParams =
  | {
      enableAuth: true;
      apiKeyStore: APIKeyStore;
    }
  | {
      enableAuth?: false;
    };

/**
 * Type definition for the cache parameters.
 *
 * @typedef {Object} CacheParams - Type parameters for caching.
 *
 * @property {boolean} [enableCache] - Enable caching for this endpoint. Must provide a Cache Store instance if set to true.
 * @property {CacheStore} [cacheStore] - Cache Store instance to use for this endpoint.
 */
type CacheParams =
  | {
      enableCache: true;
      cacheStore: CacheStore;
    }
  | {
      enableCache?: false;
    };

/**
 *
 * Type definition for the RAG parameters.
 *
 * @typedef {Object} RAGParams - Type parameters for RAG.
 *
 * @property {boolean} [enableRAG] - Enable RAG (Retrieval Augmented Generation) functionality for this endpoint. Must provide a retriever method if set to true.
 * @property {TextDataRetriever} [retriever] - Method to retrieve documents for RAG.
 * @property {RetrieverConfig} [retrieverConfig] - Configuration for the RAG retriever.
 */
type RAGParams =
  | {
      enableRAG: true;
      topic: string;
      retrieverConfig: RetrieverConfig;
      agentType?: 'close-ended';
    }
  | {
      enableRAG: true;
      topic: string;
      retriever: TextDataRetriever;
      agentType?: 'close-ended';
    }
  | {
      enableRAG?: false;
    };

/**
 * Type definition for the chat agent type parameters.
 *
 * @typedef {Object} ChatAgentTypeParams - Type parameters for the chat agent.
 *
 * @property {string} [agentType] - Type of chat agent to use for this endpoint. Can be "open-ended" or "close-ended".
 * @property {string} [topic] - Topic for the close-ended or RAG chat agent. Required if agentType is "close-ended" or if RAG is enabled.
 */
type ChatAgentTypeParams =
  | {
      agentType?: 'open-ended';
    }
  | {
      agentType?: 'close-ended';
      topic: string;
    };

/**
 * Type definition for the verbose details.
 *
 * @typedef {Object} VerboseDetails - Type definition for the verbose details.
 *
 * @property {GenerationUsage} usage - Usage details for the response.
 * @property {GenerateRequest} [request] - Request details for the response.
 * @property {ToolRequestPart[]} [tool_requests] - Tool request details for the response.
 */
type VerboseDetails = {
  usage: GenerationUsage;
  request?: GenerateRequest;
  tool_requests?: ToolRequestPart[];
};

/**
 * Type definition for the chat endpoint configurations.
 *
 * @typedef {Object} ChatEndpointConfig - Configuration object for the chat endpoint.
 *
 * @property {string} endpoint - Server endpoint to which queries should be sent to run this chat flow.
 * @property {Dotprompt} [systemPrompt] - System prompt to use for the chat endpoint.
 * @property {Dotprompt} [chatPrompt] - Chat prompt to use for the chat endpoint.
 * @property {ToolArgument[]} [tools] - Tools to use for the chat endpoint.
 * @property {ModelConfig} [modelConfig] - Model configuration to use for the chat endpoint.
 * @property {boolean} [verbose] - A flag to indicate whether to return a verbose response or not.
 * @property {OutputSchemaType} [outputSchema] - Output schema for the chat endpoint. Can be "text", "json" or "media". By default, the output format is text.
 * @property {string} [agentType] - Type of chat agent to use for this endpoint. Can be "open-ended" or "close-ended".
 * @property {string} [topic] - Topic for the close-ended or RAG chat agent. Required if agentType is "close-ended" or if RAG is enabled.
 * @property {boolean} [enableChatHistory] - Enable chat history for this endpoint. If chat ID is provided, chat history will be fetched and used to generate response. If no chat ID is provided, a new chat ID will be generated to store chat history, and will be returned in the response.
 * @property {ChatHistoryStore} [chatHistoryStore] - Chat History Store instance to use for this endpoint.
 * @property {boolean} [enableAuth] - Enable authentication for this endpoint. Must provide an API Key Store instance if set to true.
 * @property {APIKeyStore} [apiKeyStore] - API Key Store instance to use for this endpoint.
 * @property {boolean} [enableCache] - Enable caching for this endpoint. Must provide a Cache Store instance if set to true.
 * @property {CacheStore} [cacheStore] - Cache Store instance to use for this endpoint.
 * @property {boolean} [enableRAG] - Enable RAG (Retrieval Augmented Generation) functionality for this endpoint. Must provide a retriever method if set to true.
 * @property {TextDataRetriever} [retriever] - Method to retrieve documents for RAG.
 * @property {RetrieverConfig} [retrieverConfig] - Configuration for the RAG retriever.
 */
export type ChatEndpointConfig = {
  endpoint: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  systemPrompt?: Dotprompt<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chatPrompt?: Dotprompt<any>;
  tools?: ToolArgument[];
  modelConfig?: ModelConfig;
  verbose?: boolean;
  outputSchema?: OutputSchemaType;
} & ChatAgentTypeParams &
  ChatHistoryParams &
  AuthParams &
  CacheParams &
  RAGParams;

/**
 * Method to define a chat endpoint using the provided chat agent and endpoint, with support for chat history.
 * @param endpoint Server endpoint to which queries should be sent to run this chat flow.
 * @param outputSchema Output schema for the chat endpoint. Can be "text", "json" or "media". By default, the output format is text.
 * @param verbose A flag to indicate whether to return a verbose response or not.
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
export const defineChatEndpoint = (config: ChatEndpointConfig) =>
  defineFlow(
    {
      name: config.endpoint,
      inputSchema: z.object({
        query: z.string(),
        chatId: z.string().optional(),
        uid: config.enableAuth ? z.string() : z.string().optional(),
        outputSchema: OutputSchema.optional(),
      }),
      outputSchema: z.union([
        z.object({
          response:
            !config.outputSchema ||
            !config.outputSchema.format ||
            config.outputSchema?.format === 'text'
              ? z.string()
              : config.outputSchema.format === 'media'
                ? z.object({
                    contentType: z.string(),
                    url: z.string(),
                  })
                : z.unknown(),
          chatId: z.string().optional(),
          details: config.verbose
            ? z.object({
                usage: z.unknown(),
                request: z.unknown().optional(),
                tool_requests: z.array(z.unknown()).optional(),
              })
            : z.undefined(),
        }),
        z.object({
          error: z.string(),
        }),
      ]),
      middleware: [
        (req, _, next) => {
          if (config.enableAuth) {
            const key = req.headers['authorization'];
            // add API key to the request object's auth property
            Object.assign(req, {auth: {key}});
          }
          next();
        },
      ],
      authPolicy: async (auth, input) => {
        if (config.enableAuth) {
          // check if auth object is valid
          if (!auth || !auth.key) throw new Error('Error: Invalid API key');

          // check if user ID is provided
          if (!input.uid) throw new Error('Error: User ID not provided');

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
    async ({query, chatId, outputSchema}) => {
      if (query === '') return {response: 'How can I help you today?'};

      // set default response type
      if (!config.outputSchema || !config.outputSchema.format) {
        config.outputSchema = {format: 'text'};
      }

      // set output schema
      // Output schema provided in the request takes precedence over output schema configured for the endpoint
      if (!outputSchema) {
        outputSchema = config.outputSchema;
      }

      // store chat agent (will be initialized based on the provided agent type or RAG)
      let chatAgent: ChatAgent;

      // shared chat agent configurations
      const sharedChatAgentConfig = {
        systemPrompt: config.systemPrompt,
        chatPrompt: config.chatPrompt,
        tools: config.tools,
        modelConfig: config.modelConfig,
      };

      // Initialize chat agent based on the provided type
      if (!config.enableRAG) {
        // check if topic is provided
        if (config.agentType === 'close-ended' && !config.topic) {
          throw new Error(
            'Error: Topic not provided for close-ended chat agent.'
          );
        }

        // Initialize close-ended chat agent with the provided topic if close-ended agent
        // otherwise, initialize open-ended chat agent
        chatAgent =
          config.agentType === 'close-ended'
            ? new ChatAgent({
                agentType: 'close-ended',
                topic: config.topic,
                responseOutputSchema: outputSchema,
                ...sharedChatAgentConfig,
              })
            : new ChatAgent({
                agentType: 'open-ended',
                responseOutputSchema: outputSchema,
                ...sharedChatAgentConfig,
              });
      }
      // If RAG is enabled
      else {
        // Initialize chat agent with RAG
        chatAgent = new ChatAgent({
          agentType: 'rag',
          topic: config.topic,
          responseOutputSchema: outputSchema,
          ...sharedChatAgentConfig,
        });
      }

      // store query with context (includes the previous chat history if any, since that provides essential context)
      // will be used in caching and RAG, if enabled
      let queryWithContext = query;

      // store hash of the query for caching
      let queryHash: string = '';

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
        if (!queryHash || queryHash === '')
          return {
            error: 'Error: Invalid query. Could not generate hash.',
          };

        // If the query is cached, return the cached response
        try {
          // Check cache for the query
          const cachedQuery = await config.cacheStore.getRecord(queryHash);

          // check if cached response is available
          // also check if response type matches the expected response type
          if (
            cachedQuery.response &&
            cachedQuery.responseType === outputSchema.format
          ) {
            // if record is beyond the expiry date, remove it from the cache
            if (cachedQuery.expiry && cachedQuery.expiry < new Date()) {
              // remove the cached response, reset cache threshold, update last accessed time, increment cache hits
              config.cacheStore.resetCache(queryHash);
            } else {
              // update last used time and increment cache hits
              config.cacheStore.updateLastUsed(queryHash);

              // parse data based on expected response type
              try {
                let cachedModelResponse: MessageData;
                // if expected response type is "text" and cached response type is "text"
                if (
                  outputSchema.format === 'text' &&
                  cachedQuery.responseType === 'text'
                ) {
                  cachedModelResponse = {
                    role: 'model',
                    content: [{text: cachedQuery.response}],
                  };
                }
                // else if expected response type is "json" and cached response type is "json"
                else if (
                  outputSchema.format === 'json' &&
                  cachedQuery.responseType === 'json'
                ) {
                  cachedModelResponse = {
                    role: 'model',
                    content: [{data: JSON.parse(cachedQuery.response)}],
                  };
                }
                // else if expected response type is "media" and cached response type is "media"
                // also check if content type matches the expected content type
                else if (
                  outputSchema.format === 'media' &&
                  cachedQuery.responseType === 'media' &&
                  cachedQuery.response.contentType === outputSchema.contentType
                ) {
                  cachedModelResponse = {
                    role: 'model',
                    content: [
                      {
                        media: {
                          contentType: cachedQuery.response.contentType,
                          url: cachedQuery.response.url,
                        },
                      },
                    ],
                  };
                } else {
                  throw new Error(
                    `Error parsing cached data. Invalid response type.`
                  );
                }

                // if chat history is enabled
                if (config.enableChatHistory) {
                  // if chat ID is provided
                  // add the query and response to the chat history for the provided chat ID
                  if (chatId) {
                    const messages: MessageData[] = [
                      {role: 'user', content: [{text: query}]},
                      cachedModelResponse, // add the cached response
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
                      config.agentType === 'close-ended'
                        ? config.enableRAG
                          ? {agentType: 'rag', topic: config.topic}
                          : {agentType: 'close-ended', topic: config.topic}
                        : {agentType: 'open-ended'}
                    );
                    // store the chat history so the conversation can be continued
                    const messages: MessageData[] = [
                      {role: 'system', content: [{text: systemPrompt}]},
                      {role: 'user', content: [{text: query}]},
                      cachedModelResponse, // add the cached response
                    ];
                    // add messages to chat history and get the chat ID
                    chatId =
                      await config.chatHistoryStore.addChatHistory(messages);
                  }
                }
              } catch (error) {
                throw new Error(`Could not parse cached response. ${error}`);
              }

              // if chat history is enabled, return the response with the chat ID
              // when using cache and if verbose if set to true, return empty usage details
              // since no LLM model is used in this case
              return config.enableChatHistory
                ? {
                    response: cachedQuery.response,
                    chatId,
                    ...(config.verbose ? {details: {usage: {}}} : {}),
                  }
                : {
                    response: cachedQuery.response,
                    ...(config.verbose ? {details: {usage: {}}} : {}),
                  };
            }
          } else {
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
          }
        } catch (error) {
          // if query is not in cache, add it to cache to track the number of times this query is received
          // sending hash is optional. Sending so hash doesn't have to be recalculated
          // remember to add the query with context
          config.cacheStore.addQuery(
            queryWithContext,
            outputSchema.format ?? 'text', // default to text
            queryHash
          );
          // not using the error, so eslint-disable
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          error;
        }
      } // end of caching block

      try {
        // variable to store context, in case RAG is enabled
        let context: string | undefined;

        // If RAG enabled
        if (config.enableRAG) {
          // if retriever not provided, check if retrieverConfig is provided
          if (!('retriever' in config)) {
            // if retrieverConfig not provided, return an error
            if (!config.retrieverConfig) {
              return {
                error:
                  'Error: To enable RAG you must provide either retriever or retriever config.',
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
          responseOutputSchema: outputSchema,
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
          queryWithParams = {...queryWithParams, ...historyProps};
        }

        // Generate a response using the chat agent
        const response = await chatAgent.generateResponse(queryWithParams);

        // If using cache and cache store is provided, and
        // if cacheThreshold reaches 0 for this query, cache the response
        // Not supported for media response type
        if (config.enableCache && config.cacheStore && cacheThresholdReached) {
          // cache response based on response type
          if (outputSchema.format === 'json') {
            config.cacheStore.cacheResponse(queryHash, {
              responseType: 'json',
              response: JSON.stringify(response.res.output()),
            });
          }
          // if media
          else if (outputSchema.format === 'media') {
            const mediaContent = response.res.media();
            // if we have valid data
            if (mediaContent?.contentType && mediaContent?.url) {
              config.cacheStore.cacheResponse(queryHash, {
                responseType: 'media',
                response: {
                  contentType: mediaContent.contentType,
                  url: mediaContent.url,
                },
              });
            }
          }
          // if text
          else {
            config.cacheStore.cacheResponse(queryHash, {
              responseType: 'text',
              response: response.res.text(),
            });
          }
        }

        // return response based on response type
        let res;
        if (outputSchema.format === 'json') {
          res = response.res.output();
        } else if (outputSchema.format === 'media') {
          const mediaContent = response.res.media();
          // if we have valid data
          if (mediaContent?.contentType && mediaContent?.url) {
            res = {
              contentType: mediaContent.contentType,
              url: mediaContent.url,
            };
          } else {
            res = response.res.output();
          }
        } else {
          res = response.res.text();
        }

        // if verbose flag is set, return verbose details
        const verboseDetails: VerboseDetails = {
          usage: response.res.usage,
          request: response.res.request,
          tool_requests: response.res.toolRequests(),
        };

        // if chat history is enabled, return the response with the chat ID
        return config.enableChatHistory
          ? {
              response: res,
              chatId: response.chatId,
              ...(config.verbose ? {details: verboseDetails} : {}),
            }
          : {
              response: res,
              ...(config.verbose ? {details: verboseDetails} : {}),
            };
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
