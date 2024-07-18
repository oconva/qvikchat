import {
  CollectionReference,
  FieldValue,
  WriteResult,
} from 'firebase-admin/firestore';
import {generateHash} from '../utils/utils';
import {
  CacheRecord,
  CacheResponseRecord,
  CacheStore,
  CacheStoreResponseTypes,
} from './cache-store';
import {app} from 'firebase-admin';

/**
 * Configuration for the in-memory cache store.
 * @property recordExpiryDuration - The duration after which each record expires.
 * @property cacheQueryAfterThreshold - The threshold after which a query is cached.
 */
export type FirestoreCacheStoreConfig = {
  /** Firebase app instance */
  firebaseApp: app.App;
  /** name of the collection for cache store */
  collectionName: string;
  /** duration after which each record expires */
  recordExpiryDuration?: number;
  /** threshold after which a query is cached */
  cacheQueryAfterThreshold?: number;
};

/**
 * In-memory cache store is an implementation of the cache store interface that stores cache records in memory.
 */
export class FirestoreCacheStore implements CacheStore {
  /** Map containing all cache records */
  cache: CollectionReference;
  /** duration after which each record expires */
  recordExpiryDuration: number;
  /** threshold after which a query is cached, e.g., n=3 means response will be cached when same query request received a third time */
  cacheQueryAfterThreshold: number;

  constructor({
    firebaseApp,
    collectionName,
    recordExpiryDuration,
    cacheQueryAfterThreshold,
  }: FirestoreCacheStoreConfig) {
    this.cache = firebaseApp.firestore().collection(collectionName);
    (this.recordExpiryDuration = recordExpiryDuration ?? 1000 * 60 * 60 * 24), // 24 hours;
      (this.cacheQueryAfterThreshold = cacheQueryAfterThreshold ?? 3);
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
   */
  async addQuery(
    query: string,
    responseType: CacheStoreResponseTypes,
    hash?: string
  ): Promise<WriteResult> {
    // verify query data is valid
    if (query === '') throw new Error('Invalid query data');

    // Create a new cache record
    const record: CacheRecord = {
      query, // complete query (may include chat history)
      responseType, // response type supported by cache store
      cacheThreshold: this.cacheQueryAfterThreshold, // set cache threshold to the configured value
      cacheHits: 0,
    };

    // Add the record to the cache
    return this.cache.doc(hash ?? generateHash(record.query)).set(record);
  }

  /**
   * Caches the response for a specific query.
   * @param hash - The hash of the query.
   * @param responseRecord - The response record containing the response type and response.
   * @returns True if the response was cached successfully, false otherwise.
   */
  async cacheResponse(
    hash: string,
    responseRecord: CacheResponseRecord
  ): Promise<WriteResult> {
    // verify query data is valid
    if (hash === '' || !responseRecord.response)
      throw new Error('Invalid hash or response data');

    // update cache record with response and expiry date
    return this.cache.doc(hash).update({
      responseType: responseRecord.responseType,
      response: responseRecord.response,
      expiry: new Date(Date.now() + this.recordExpiryDuration),
    });
  }

  /**
   * Adds a cache record to the cache.
   * @param query - The query to cache.
   * @param responseRecord - The response record containing the response type and response.
   */
  async addRecord(
    query: string,
    responseRecord: CacheResponseRecord
  ): Promise<WriteResult> {
    // verify query data is valid
    if (query === '' || !responseRecord.response)
      throw new Error('Invalid query or response data');

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
      return this.cache.doc(generateHash(record.query)).set(record);
    }

    // if response type is text or JSON
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
    return this.cache.doc(generateHash(record.query)).set(record);
  }

  /**
   * Retrieves a cache record from the cache.
   * @param hash - The hash of the record to be retrieved.
   * @returns The cache record, if found. Otherwise, undefined.
   * @throws Error if the record is not found in the cache.
   */
  async getRecord(hash: string): Promise<CacheRecord> {
    // Get the record from the cache
    const record = await this.cache.doc(hash).get();
    return record.data() as CacheRecord;
  }

  /**
   * Deletes a cache record from the cache.
   * @param hash - The hash of the record to be deleted.
   * @returns A boolean indicating whether the record was successfully deleted.
   */
  async deleteRecord(hash: string): Promise<WriteResult> {
    // Delete the record from the cache
    return await this.cache.doc(hash).delete();
  }

  /**
   * Checks if a cache record is expired.
   * @param hash - The hash of the record to be checked.
   * @returns A boolean indicating whether the record is expired.
   */
  isExpired(record: CacheRecord): boolean {
    if (record && record.expiry) {
      // Compare the current time with the record's expiry time
      return Date.now() > record.expiry.getTime();
    }
    return false;
  }

  /**
   * Increments the cache threshold for a specific query.
   * @param hash - The hash of the query.
   * @throws Error if the record is not found in the cache.
   * @returns A promise with write operation result.
   */
  async decrementCacheThreshold(hash: string): Promise<WriteResult> {
    // Get the record from the cache
    const record = await this.cache.doc(hash).get();
    // Throw an error if the record is not found
    if (!record) throw new Error('Record not found in cache');
    // extract the cache record data
    const data = record.data() as CacheRecord;
    // Decrement the cache threshold
    return await this.cache.doc(hash).update({
      cacheThreshold: data.cacheThreshold - 1,
    });
  }

  /**
   * Increments the cache hits for a specific query.
   * Use this every time a cached response is used.
   * @param hash - The hash of the query.
   * @returns A promise with write operation result.
   * @throws Error if the record is not found in the cache.
   */
  async incrementCacheHits(hash: string): Promise<WriteResult> {
    // Increment the cache hits
    return await this.cache.doc(hash).update({
      cacheHits: FieldValue.increment(1),
    });
  }
}
