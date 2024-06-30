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
 * Cache record contains the data of a processed query, along with the expiry date of the record.
 */
export type CacheRecord = {
	/** query + chat history */
	query: string;
	/** cached response */
	response?: string;
	/** expiry date of the cache record */
	expiry?: ExpiryDate;
	/** cache threshold. Query data is cached after this threshold reaches zero. Avoids the need to cache all data for every query. */
	cacheThreshold: number;
};

/** Cache collection is a map containing all cache records. */
export type CacheCollection = Map<QueryHash, CacheRecord>;

/**
 * Cache store interface provides methods to manage cache records.
 */
export interface CacheStore {
	/** Map containing all cache records */
	cache: CacheCollection;
	/** duration after which each record expires */
	recordExpiryDuration: number;
	/** threshold after which a query is cached, e.g., n=3 means a specific query will be cached if received more than 3 times */
	cacheQueryAfterThreshold: number;

	/**
	 * Check if a given query hash exists.
	 * @param hash - The query hash to check.
	 * @returns Returns true if the query hash exists in the cache, false otherwise.
	 */
	queryExists(hash: QueryHash): boolean;

	/**
	 * Add a new query to the cache without caching the response.
	 * Primarily used to set the cache threshold for a query, i.e., to track the number of times this query is received.
	 * After the cache threshold is reached, the response will be cached.
	 * @param query - The query to add.
	 * @param hash - Hash value of the query, if not provided, it will be generated.
	 * @returns Returns void.
	 */
	addQuery(query: string, hash?: string): void;

	/**
	 * Cache the response for a given query hash.
	 * Automatically sets the expiry date of the record based on cache store configurations.
	 * @param hash - The query hash to cache the response for.
	 * @param response - The response to cache.
	 * @returns Returns true if the response was cached successfully, false otherwise.
	 */
	cacheResponse(hash: QueryHash, response: string): boolean;

	/**
	 * Add a new cache record with the given query and response.
	 * Automatically sets the expiry date of the record based on cache store configurations.
	 * @param query - The query to cache.
	 * @param response - The response to cache.
	 */
	addRecord(query: string, response: string): void;

	/**
	 * Get a specific cache record.
	 * @param hash - The query hash of the cache record to retrieve.
	 * @returns Returns the cache record if found, undefined otherwise.
	 */
	getRecord(hash: QueryHash): CacheRecord | undefined;

	/**
	 * Delete a cache record.
	 * @param hash - The query hash of the cache record to delete.
	 */
	deleteRecord(hash: QueryHash): void;

	/**
	 * Check if a cache record is expired.
	 * @param hash - The query hash of the cache record to check.
	 * @returns Returns true if the cache record is expired, false otherwise.
	 */
	isExpired(hash: QueryHash): boolean;

	/**
	 * Increment the cache threshold for a query hash.
	 * @param hash - The query hash to increment the cache threshold for.
	 */
	decrementCacheThreshold(hash: QueryHash): void;

	/**
	 * Check if the cache threshold for a query hash has reached zero.
	 * @param hash - The query hash to check.
	 * @returns Returns true if the cache threshold has reached zero, false otherwise.
	 */
	isCacheThresholdReached(hash: QueryHash): boolean;
}
