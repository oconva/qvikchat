import { CollectionReference, WriteResult } from "firebase-admin/firestore";

/**
 * Represents an API key.
 */
export type APIKey = string;

/**
 * Represents the status of an API key.
 */
export type APIKeyStatus = "active" | "disabled";

/**
 * Represents the endpoints accessible by an API key.
 */
export type APIKeyEndpoints = string[] | "all";

/**
 * Represents a record of an API key.
 */
export type APIKeyRecord = {
  /**
   * The number of requests made using the API key.
   */
  requests: number;
  /**
   * The maximum number of requests allowed for the API key.
   */
  requestsLimit?: number;
  /**
   * The date when the API key was last used.
   */
  lastUsed: Date;
  /**
   * The status of the API key.
   */
  status: APIKeyStatus;
  /**
   * The endpoints accessible by the API key.
   */
  endpoints: APIKeyEndpoints;
  /**
   * The unique identifier of the API key.
   */
  uid: string;
};

/**
 * Represents a new API key record.
 */
export type NewAPIKeyRecord = {
  /**
   * The unique identifier of the API key.
   */
  uid: string;
  /**
   * The status of the API key.
   */
  status?: APIKeyStatus;
  /**
   * The endpoints accessible by the API key.
   */
  endpoints?: APIKeyEndpoints;
  /**
   * The maximum number of requests allowed for the API key.
   */
  requestsLimit?: number;
};

/**
 * Represents a collection of API keys.
 */
export type APIKeyCollection = Map<APIKey, APIKeyRecord>;

/**
 * Represents an API key store.
 */
export interface APIKeyStore {
  /**
   * Map containing all API keys.
   */
  keys: APIKeyCollection | CollectionReference;

  /**
   * Collection reference to the Firestore collection containing API keys.
   */
  // collectionRef: CollectionReference;

  /**
   * Adds a new API key record.
   * @param key - The API key to add.
   * @param config - The configuration for the new API key record.
   * @returns A promise that resolves to a boolean indicating whether the API key was successfully added.
   */
  addKey: (
    key: APIKey,
    config: NewAPIKeyRecord
  ) => Promise<boolean> | Promise<WriteResult>;

  /**
   * Updates an existing API key record.
   * @param key - The API key to update.
   * @param status - The new status for the API key.
   * @param endpoints - The new endpoints for the API key.
   * @param requests - The new number of requests for the API key.
   * @returns A promise that resolves to a boolean indicating whether the API key was successfully updated.
   */
  updateKey: ({
    key,
    status,
    endpoints,
    requests,
  }: {
    key: APIKey;
    status?: APIKeyStatus;
    endpoints?: string[] | "all";
    requests?: number;
  }) => Promise<boolean> | Promise<WriteResult>;

  /**
   * Gets a specific API key record.
   * @param key - The API key to retrieve.
   * @returns A promise that resolves to the API key record, or undefined if the API key does not exist.
   */
  getKey: (key: APIKey) => Promise<APIKeyRecord | undefined>;

  /**
   * Deletes an API key record.
   * @param key - The API key to delete.
   * @returns A promise that resolves to a boolean indicating whether the API key was successfully deleted.
   */
  deleteKey: (key: APIKey) => Promise<boolean> | Promise<WriteResult>;

  /**
   * Increments the requests count for an API key.
   * @param key - The API key to increment the requests count for.
   * @returns A promise that resolves to a boolean indicating whether the requests count was successfully incremented.
   */
  incrementRequests: (key: APIKey) => Promise<boolean> | Promise<WriteResult>;
}
