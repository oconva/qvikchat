import { generateHash } from '../utils/utils';
import {
	CacheCollection,
	CacheRecord,
	CacheStore,
	QueryHash,
} from './cache-store';

/**
 * Configuration for the in-memory cache store.
 * @property recordExpiryDuration - The duration after which each record expires.
 * @property cacheQueryAfterThreshold - The threshold after which a query is cached.
 */
export type InMemoryCacheStoreConfig = {
	/** duration after which each record expires */
	recordExpiryDuration: number;
	/** threshold after which a query is cached */
	cacheQueryAfterThreshold: number;
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
			recordExpiryDuration,
			cacheQueryAfterThreshold,
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
	 * Checks if a query exists in the cache.
	 * @param hash - The hash of the query.
	 * @returns A boolean indicating whether the query exists in the cache.
	 */
	queryExists(hash: string): boolean {
		// Check if the query exists in the cache
		return this.cache.has(hash);
	}

	/**
	 * Adds a query to the cache without caching the response.
	 * Primarily used to set the cache threshold for a query, i.e., to track the number of times this query is received.
	 * After the cache threshold is reached, the response will be cached.
	 * @param query - The query to be added.
	 * @param hash - The hash of the query. If not provided, it will be generated.
	 */
	addQuery(query: string, hash?: string): void {
		// verify query data is valid
		if (query === '') return;

		// Create a new cache record
		const record: CacheRecord = {
			query, // complete query (may include chat history)
			cacheThreshold: this.cacheQueryAfterThreshold, // set cache threshold to the configured value
		};

		// Add the record to the cache
		this.cache.set(hash ?? generateHash(record.query), record);
	}

	/**
	 * Caches the response for a specific query.
	 * @param hash - The hash of the query.
	 * @param response - The response to be cached.
	 * @returns True if the response was cached successfully, false otherwise.
	 */
	cacheResponse(hash: string, response: string): boolean {
		// verify query data is valid
		if (hash === '' || response === '') return false;

		// Get the record from the cache
		const record = this.cache.get(hash);
		if (record) {
			// Cache the response
			record.response = response;
			record.expiry = new Date(Date.now() + this.recordExpiryDuration);
			return true;
		}
		return false;
	}

	/**
	 * Adds a cache record to the cache.
	 * @param record - The cache record to be added.
	 */
	addRecord(query: string, response: string): void {
		// verify query data is valid
		if (query === '' || response === '') return;

		// Create a new cache record
		const record: CacheRecord = {
			query, // complete query (may include chat history)
			response,
			expiry: new Date(Date.now() + this.recordExpiryDuration), // set expiry date based on cache store configurations
			cacheThreshold: 0, // set cache threshold to 0 since query response is being cached now
		};

		// Add the record to the cache
		this.cache.set(generateHash(record.query), record);
	}

	/**
	 * Retrieves a cache record from the cache.
	 * @param hash - The hash of the record to be retrieved.
	 * @returns The cache record, if found. Otherwise, undefined.
	 */
	getRecord(hash: string): CacheRecord | undefined {
		// Get the record from the cache
		return this.cache.get(hash);
	}

	/**
	 * Deletes a cache record from the cache.
	 * @param hash - The hash of the record to be deleted.
	 * @returns A boolean indicating whether the record was successfully deleted.
	 */
	deleteRecord(hash: string): boolean {
		// Delete the record from the cache
		return this.cache.delete(hash);
	}

	/**
	 * Checks if a cache record is expired.
	 * @param hash - The hash of the record to be checked.
	 * @returns A boolean indicating whether the record is expired.
	 */
	isExpired(hash: string): boolean {
		// Check if the record is expired
		const record = this.cache.get(hash);
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
	decrementCacheThreshold(hash: string): number {
		// Decrement the cache threshold
		const record = this.cache.get(hash);
		if (record) {
			record.cacheThreshold !== 0 ? record.cacheThreshold-- : 0;
			return record.cacheThreshold;
		}
		return -1;
	}

	/**
	 * Checks if the cache threshold for a specific query has reached zero.
	 * @param hash - The hash of the query.
	 * @returns A boolean indicating whether the cache threshold has reached zero.
	 */
	isCacheThresholdReached(hash: string): boolean {
		const record = this.cache.get(hash);
		return record ? record.cacheThreshold === 0 : false;
	}
}
