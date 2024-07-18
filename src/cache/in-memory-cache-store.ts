import {generateHash} from '../utils/utils';
import {
  CacheCollection,
  CacheRecord,
  CacheResponseRecord,
  CacheStore,
  CacheStoreResponseTypes,
  QueryHash,
} from './cache-store';

/**
 * Configuration for the in-memory cache store.
 * @property recordExpiryDuration - The duration after which each record expires.
 * @property cacheQueryAfterThreshold - The threshold after which a query is cached.
 */
export type InMemoryCacheStoreConfig = {
  /** duration after which each record expires */
  recordExpiryDuration?: number;
  /** threshold after which a query is cached */
  cacheQueryAfterThreshold?: number;
};

/**
 * In-memory cache store is an implementation of the cache store interface that stores cache records in memory.
 */
export class InMemoryCacheStore implements CacheStore {
  /** Map containing all cache records */
  cache: CacheCollection;
  /** duration after which each record expires */
  recordExpiryDuration: number;
  /** threshold after which a query is cached, e.g., n=3 means response will be cached when same query request received a third time */
  cacheQueryAfterThreshold: number;

  constructor(
    {
      recordExpiryDuration = 1000 * 60 * 60 * 24,
      cacheQueryAfterThreshold = 3,
    }: InMemoryCacheStoreConfig = {
      recordExpiryDuration: 1000 * 60 * 60 * 24, // 24 hours
      cacheQueryAfterThreshold: 3,
    }
  ) {
    this.cache = new Map<QueryHash, CacheRecord>();
    this.recordExpiryDuration = recordExpiryDuration;
    this.cacheQueryAfterThreshold = cacheQueryAfterThreshold;
  }

  /**
   * Adds a query to the cache without caching the response.
   * Primarily used to set the cache threshold for a query, i.e., to track the number of times this query is received.
   * After the cache threshold is reached, the response will be cached.
   * The type of response that the query is being made for is also vital.
   * For example, queries made specifically for JSON response type should be treated differently than
   * queries being made for TEXT response type, even if the query content is same.
   * @param query - The query to be added.
   * @param responseType - The response type for the query.
   * @param hash - The hash of the query. If not provided, it will be generated.
   * @throws Error if unable to add the query to the cache.
   */
  async addQuery(
    query: string,
    responseType: CacheStoreResponseTypes,
    hash?: string
  ): Promise<void> {
    // verify query data is valid
    if (query === '') throw new Error('Invalid query data');

    // Create a new cache record
    const record: CacheRecord = {
      query, // complete query (may include chat history and context)
      responseType: responseType, // set response type to empty
      cacheThreshold: this.cacheQueryAfterThreshold, // set cache threshold to the configured value
      cacheHits: 0, // set cache hits to 0
    };

    // Add the record to the cache
    this.cache.set(hash ?? generateHash(record.query), record);
  }

  /**
   * Caches the response for a specific query.
   * @param hash - The hash of the query.
   * @param responseRecord - The response record containing the response type and response.
   * @throws Error if unable to cache the response.
   * @returns True if the response was cached successfully, throws an error otherwise.
   */
  cacheResponse(hash: string, responseRecord: CacheResponseRecord): true {
    // verify query data is valid
    if (hash === '' || !responseRecord.response)
      throw new Error('Invalid hash or response data');

    // Get the record from the cache
    const record = this.cache.get(hash);
    if (!record) throw new Error('Record not found in cache');

    // Cache the response
    record.responseType = responseRecord.responseType;
    record.response = responseRecord.response;
    record.expiry = new Date(Date.now() + this.recordExpiryDuration);
    return true;
  }

  /**
   * Adds a cache record to the cache.
   * @param query - The query to cache.
   * @param responseType - The response type for the query.
   * @param response - The response to cache.
   */
  async addRecord(
    query: string,
    responseRecord: CacheResponseRecord
  ): Promise<void> {
    // verify query data is valid
    if (query === '' || !responseRecord.response) return;

    // Check if the response type is media
    if (responseRecord.responseType === 'media') {
      // Create a new cache record
      const record: CacheRecord = {
        query, // complete query (may include chat history and context)
        responseType: responseRecord.responseType,
        response: responseRecord.response,
        expiry: new Date(Date.now() + this.recordExpiryDuration), // set expiry date based on cache store configurations
        cacheThreshold: 0, // set cache threshold to 0 since query response is being cached now
        cacheHits: 0, // set cache hits to 0
      };

      // Add the record to the cache
      this.cache.set(generateHash(record.query), record);
    } else {
      // Create a new cache record
      const record: CacheRecord = {
        query, // complete query (may include chat history and context)
        responseType: responseRecord.responseType,
        response: responseRecord.response as string,
        expiry: new Date(Date.now() + this.recordExpiryDuration), // set expiry date based on cache store configurations
        cacheThreshold: 0, // set cache threshold to 0 since query response is being cached now
        cacheHits: 0, // set cache hits to 0
      };

      // Add the record to the cache
      this.cache.set(generateHash(record.query), record);
    }
  }

  /**
   * Retrieves a cache record from the cache.
   * @param hash - The hash of the record to be retrieved.
   * @returns The cache record, if found. Otherwise, undefined.
   * @throws Error if the record is not found in the cache.
   */
  async getRecord(hash: string): Promise<CacheRecord> {
    // Get the record from the cache
    const record = this.cache.get(hash);
    // Throw an error if the record is not found
    if (!record) throw new Error('Record not found in cache');
    // Return the record
    return record;
  }

  /**
   * Deletes a cache record from the cache.
   * @param hash - The hash of the record to be deleted.
   * @returns A boolean indicating whether the record was successfully deleted.
   * @throws Error if the record is not found in the cache.
   */
  deleteRecord(hash: string): boolean {
    // Delete the record from the cache
    return this.cache.delete(hash);
  }

  /**
   * Checks if a cache record is expired.
   * @param record - The cache record to be checked.
   * @returns A boolean indicating whether the record is expired.
   */
  isExpired(record: CacheRecord): boolean {
    // Check if the record is expired
    if (record && record.expiry) {
      // Compare the current time with the record's expiry time
      return Date.now() > record.expiry.getTime();
    }
    return false;
  }

  /**
   * Increments the cache threshold for a specific query.
   * @param hash - The hash of the query.
   * @returns The updated cache threshold if the query exists in the cache, -1 otherwise.
   */
  async decrementCacheThreshold(hash: string): Promise<number> {
    // Decrement the cache threshold
    const record = this.cache.get(hash);
    if (record) {
      record.cacheThreshold !== 0 ? record.cacheThreshold-- : 0;
      return record.cacheThreshold;
    }
    return -1;
  }

  /**
   * Increments the cache hits for a specific query.
   * Use this every time a cached response is used.
   * @param hash - The hash of the query.
   * @returns The updated cache hits if the query exists in the cache.
   * @throws Error if the record is not found in the cache.
   */
  async incrementCacheHits(hash: string): Promise<void> {
    // Increment the cache hits
    const record = this.cache.get(hash);
    // if no record, throw an error
    if (!record) throw new Error('Record not found in cache');
    // else, increment cache hits
    record.cacheHits = record.cacheHits + 1;
  }
}
