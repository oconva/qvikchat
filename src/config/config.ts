import type {ConfigOptions} from '@genkit-ai/core';
import type {SupportedModels} from '../models/models';
import type {StartServerParamsType} from '../core/server';

/**
 * Type for the cache store configuration
 */
export type GlobalCacheStoreConfig = {
  /** duration after which each record expires */
  recordExpiryDuration: number;
  /** threshold after which a query is cached, e.g., n=3 means a specific query will be cached if received more than 3 times */
  cacheQueryAfterThreshold: number;
};

/**
 * Cache store configuration object
 */
export const globalCacheStoreConfig = {
  recordExpiryDuration: 1000 * 60 * 60 * 24, // 24 hours
  cacheQueryAfterThreshold: 3, // cache query after 3 requests
};

/**
 * Interface for the global configuration object
 *
 * @interface GlobalConfigInterface
 *
 * @property {string} primaryLLM - The primary LLM to use (for example, for chat completion tasks)
 * @property {ConfigOptions} genkitConfig - The configuration options for the Genkit library
 * @property {StartServerParamsType} startServerParams - Parameters for starting the server
 * @property {boolean} enableAPIKeyAuth - Enable API key authentication
 * @property {CacheStoreConfig} cacheStoreConfig - Cache store configuration
 *
 * You can add more LLMs if required. For example, you may add a selfQueryRagLLM for self-query tasks, or a contextCompressionLLM for context compression tasks. This will allow you to specify LLM models to use for various purposes at one place.
 */
export interface GlobalConfigInterface {
  /** Primary LLM to use */
  primaryLLM?: SupportedModels;
  /** Genkit configuration options */
  genkitConfig?: ConfigOptions;
  /** Parameters for server */
  startServerParams?: StartServerParamsType;
  /** Enable API key authentication */
  enableAPIKeyAuth?: boolean;
  /** Cache store configuration */
  cacheStoreConfig?: GlobalCacheStoreConfig;
}

/**
 * Global configuration object
 * @type {GlobalConfigInterface}
 */
export const GLOBAL_CONFIG: GlobalConfigInterface = {
  primaryLLM: 'gemini15Flash',
  genkitConfig: {
    logLevel: 'warn',
    enableTracingAndMetrics: true,
  },
  startServerParams: {
    port: 8884,
  },
  enableAPIKeyAuth: true,
  cacheStoreConfig: globalCacheStoreConfig,
};

/**
 * Define all your endpoints in one place.
 */
export const ENDPOINTS = {
  CHAT: {
    OPEN_ENDED: 'chat-open',
    OPEN_ENDED_WITH_HISTORY: 'chat-open-history',
    OPEN_ENDED_HISTORY_AUTH_CACHED: 'chat-open-history-auth-cached',
    CLOSE_ENDED: 'chat-close',
    CLOSE_ENDED_WITH_HISTORY: 'chat-close-history',
    CLOSE_ENDED_HISTORY_AUTH_CACHED: 'chat-close-history-auth-cached',
    RAG: 'chat-rag',
    RAG_WITH_HISTORY: 'chat-rag-history',
    RAG_HISTORY_AUTH_CACHED: 'chat-rag-history-auth-cached',
  },
};
