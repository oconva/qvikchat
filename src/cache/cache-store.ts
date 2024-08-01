import type {CollectionReference, WriteResult} from 'firebase-admin/firestore';

/**
 * Expiry date is the date and time when the cache record will expire.
 * After this date, the record will be removed from the cache.
 *
 * @example new Date('2022-12-31T23:59:59')
 */
export type ExpiryDate = Date;

/**
 * Query Hash contains hash of the whole query (includes user query and past conversation history).
 */
export type QueryHash = string;

/**
 * Cache store response types supported by the cache store.
 */
export type CacheStoreResponseTypes = 'text' | 'json' | 'media';

/**
 * Cache response media type contains the content type and URL of the response.
 */
export type CacheResponseMediaType = {
  contentType: string;
  url: string;
};

/**
 * Cache store response stored as a string for response type "text" and "JSON", and
 * for type "media" as an object containing the content type and URL of the response.
 */
export type CacheResponseRecord =
  | {
      /** response type supported by cache store */
      responseType?: 'text' | 'json';
      /** cached response */
      response?: string;
    }
  | {
      /** response type supported by cache store */
      responseType?: 'media';
      /** cached response */
      response?: CacheResponseMediaType;
    };

/**
 * Cache record contains the data of a processed query, along with the expiry date of the record.
 */
export type CacheRecord = {
  /** query + chat history */
  query: string;
  /** expiry date of the cache record */
  expiry?: ExpiryDate;
  /** cache threshold. Query data is cached after this threshold reaches zero. Avoids the need to cache all data for every query. */
  cacheThreshold: number;
  /** record number of cache hits */
  cacheHits: number;
  /** last accessed (response may not have been used, e.g., if not available or expired) */
  lastAccessed?: Date;
  /** last used (cached response) */
  lastUsed?: Date;
} & CacheResponseRecord;

/** Cache collection is a map containing all cache records. */
export type CacheCollection = Map<QueryHash, CacheRecord>;

/**
 * Cache store interface provides methods to manage cache records.
 */
export interface CacheStore {
  /** Map containing all cache records */
  cache: CacheCollection | CollectionReference;
  /** duration after which each record expires */
  recordExpiryDuration: number;
  /** threshold after which a query is cached, e.g., n=3 means a specific query will be cached if received more than 3 times */
  cacheQueryAfterThreshold: number;

  /**
   * Add a new query to the cache without caching the response.
   * Primarily used to set the cache threshold for a query, i.e., to track the number of times this query is received.
   * After the cache threshold is reached, the response will be cached.
   * @param query - The query to add.
   * @param responseType - The response type for the query.
   * @param hash - Hash value of the query, if not provided, it will be generated.
   * @returns Returns void.
   */
  addQuery(
    query: string,
    responseType: CacheStoreResponseTypes,
    hash?: string
  ): Promise<void> | Promise<WriteResult>;

  /**
   * Add a new cache record with the given query, response type, and response.
   * Automatically sets the expiry date of the record based on cache store configurations.
   * The type of response that the query is being made for is also vital.
   * For example, queries made specifically for JSON response type should be treated differently than
   * queries being made for TEXT response type, even if the query content is same.
   * @param query - The query to cache.
   * @param responseRecord - The response record containing the response type and response.
   */
  addRecord(
    query: string,
    responseRecord: CacheResponseRecord
  ): Promise<void> | Promise<WriteResult>;

  /**
   * Cache the response for a given query hash.
   * Automatically sets the expiry date of the record based on cache store configurations.
   * @param hash - The query hash to cache the response for.
   * @param responseRecord - The response record containing the response type and response.
   * @returns Returns true if the response was cached successfully, false otherwise.
   */
  cacheResponse(
    hash: QueryHash,
    responseRecord: CacheResponseRecord
  ): boolean | Promise<WriteResult>;

  /**
   * Method to use when cached response is beyond expiry date.
   * Performs the following actions:
   * - clears the response for a given query hash.
   * - resets the cache threshold for the query hash.
   * - increments the cache hits for the query hash.
   * - updates the last accessed time for the query hash.
   * @param hash The query hash for which to clear the response.
   */
  resetCache(hash: QueryHash): boolean | Promise<WriteResult>;

  /**
   * Get a specific cache record.
   * @param hash - The query hash of the cache record to retrieve.
   * @returns Returns the cache record if found.
   * @throws Throws an error if the cache record is not found.
   */
  getRecord(hash: QueryHash): Promise<CacheRecord>;

  /**
   * Delete a cache record.
   * @param hash - The query hash of the cache record to delete.
   */
  deleteRecord(hash: QueryHash): boolean | Promise<WriteResult>;

  /**
   * Check if a cache record is expired.
   * @param record - The cache record to check.
   * @returns Returns true if the cache record is expired, false otherwise.
   */
  isExpired(record: CacheRecord): boolean;

  /**
   * Increment the cache threshold for a query hash.
   * @param hash - The query hash to increment the cache threshold for.
   */
  decrementCacheThreshold(
    hash: QueryHash
  ): Promise<number> | Promise<WriteResult>;

  /**
   * Increment the cache hits every time a cached response is used.
   *
   * @param hash - The query hash to increment the cache hits for.
   */
  incrementCacheHits(hash: QueryHash): Promise<void> | Promise<WriteResult>;

  /**
   * Update the last accessed time for a cache record.
   *
   * @param hash - The query hash to update the last accessed time for.
   */
  updateLastAccessed(hash: QueryHash): Promise<void> | Promise<WriteResult>;

  /**
   * Update the last used time for a cache record.
   * Optionally, accepts a boolean as the second parameter value indicating whether to increment the cache hits for the query hash.
   *
   * @param hash - The query hash to update the last used time for.
   */
  updateLastUsed(
    hash: QueryHash,
    incrementCacheHits?: boolean
  ): Promise<void> | Promise<WriteResult>;
}

// export supported cache stores
export {InMemoryCacheStore} from './in-memory-cache-store';
export {
  FirestoreCacheStore,
  type FirestoreCacheStoreConfig,
} from './firestore-cache-store';
