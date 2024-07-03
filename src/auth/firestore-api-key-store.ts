import {
  APIKeyCollection,
  APIKeyStore,
  APIKey,
  APIKeyRecord,
  APIKeyStatus,
  NewAPIKeyRecord,
} from "./api-key-store";

/**
 * Configurations for the FirestoreAPIKeyStore.
 * @property collectionName - The name of the Firestore collection to store API keys.
 */
type FirestoreAPIKeyStoreConfig = {
  collectionName: string;
};

/**
 * Represents an in-memory implementation of the APIKeyStore interface.
 */
export class FirestoreAPIKeyStore implements APIKeyStore {
  /**
   * Name of the collection in Firestore where API keys are stored.
   */
  collectionName: string;
  /**
   * The collection of API keys.
   */
  keys: APIKeyCollection;

  /**
   * Creates an instance of InMemoryAPIKeyStore.
   */
  constructor(config: FirestoreAPIKeyStoreConfig) {
    this.keys = new Map<APIKey, APIKeyRecord>();
    this.collectionName = config.collectionName;
  }

  /**
   * Verifies if an API key is valid and active.
   * @param key - The API key to verify.
   * @returns A boolean indicating whether the API key is valid and active.
   */
  async verifyAPIKey(key: string): Promise<boolean> {
    return this.keys.has(key) && this.keys.get(key)?.status === "active";
  }

  /**
   * Adds a new API key to the store.
   * By default, API key is disabled and has access to no endpoints.
   * @param key - The API key to add.
   * @param record - The record associated with the API key.
   * @returns A boolean indicating whether the API key was added successfully.
   * @throws Throws an error if the UID is not provided.
   */
  async addKey(
    key: string,
    { status = "disabled", endpoints = [], uid }: NewAPIKeyRecord
  ): Promise<boolean> {
    if (uid === "") throw new Error("UID is required to create an API key");

    this.keys.set(key, {
      requests: 0,
      lastUsed: new Date(),
      status,
      endpoints,
      uid,
    });

    return true;
  }

  /**
   * Updates the properties of an existing API key.
   * @param options - The options for updating the API key.
   * @returns A boolean indicating whether the API key was updated successfully.
   * @throws Throws an error if the API key is not found.
   */
  async updateKey({
    key,
    status,
    flows,
    requests,
  }: {
    key: string;
    status?: APIKeyStatus;
    flows?: string[] | "all";
    requests?: number;
  }): Promise<boolean> {
    const apiKey = this.keys.get(key);
    if (!apiKey) throw new Error("API key not found");

    if (status) {
      apiKey.status = status;
    }
    if (flows) {
      apiKey.endpoints = flows;
    }
    if (requests) {
      apiKey.requests = requests;
    }
    // if successful, return true
    return true;
  }

  /**
   * Retrieves the record associated with an API key.
   * @param key - The API key to retrieve.
   * @returns The record associated with the API key.
   */
  async getKey(key: string): Promise<APIKeyRecord | undefined> {
    return this.keys.get(key);
  }

  /**
   * Deletes an API key from the store.
   * @param key - The API key to delete.
   * @returns A boolean indicating whether the API key was deleted successfully.
   */
  async deleteKey(key: string): Promise<boolean> {
    return this.keys.delete(key);
  }

  /**
   * Increments the number of requests made using an API key.
   * @param key - The API key to increment requests for.
   * @returns A boolean indicating whether the requests were incremented successfully.
   * @throws Throws an error if the API key is not found.
   */
  async incrementRequests(key: string): Promise<boolean> {
    const apiKey = this.keys.get(key);
    if (!apiKey) throw new Error("API key not found");

    return this.updateKey({
      key,
      requests: apiKey.requests + 1,
    });
  }
}
