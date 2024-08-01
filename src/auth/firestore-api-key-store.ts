import {
  type CollectionReference,
  FieldValue,
  type WriteResult,
} from 'firebase-admin/firestore';
import type {
  APIKeyStore,
  APIKeyRecord,
  APIKeyStatus,
  NewAPIKeyRecord,
} from './api-key-store';
import {app} from 'firebase-admin';

/**
 * Configurations for the FirestoreAPIKeyStore.
 * @property collectionName - The name of the Firestore collection to store API keys.
 */
export type FirestoreAPIKeyStoreConfig = {
  firebaseApp: app.App;
  collectionName: string;
};

/**
 * Represents an Firestore implementation of the APIKeyStore interface.
 */
export class FirestoreAPIKeyStore implements APIKeyStore {
  /**
   * The collection of API keys or a reference to the Firestore collection.
   */
  keys: CollectionReference;

  /**
   * Creates an instance of FirestoreAPIKeyStore.
   */
  constructor(config: FirestoreAPIKeyStoreConfig) {
    this.keys = config.firebaseApp
      .firestore()
      .collection(config.collectionName);
  }

  /**
   * Adds a new API key to the store.
   * By default, API key is disabled and has access to no endpoints.
   * @param key - The API key to add.
   * @param record - The record associated with the API key.
   * @returns A boolean indicating whether the API key was added successfully.
   * @throws Throws an error if unable to add the API key.
   */
  async addKey(
    key: string,
    {status = 'disabled', endpoints = [], uid}: NewAPIKeyRecord
  ): Promise<WriteResult> {
    if (uid === '') throw new Error('UID is required to create an API key');
    // Add the new API key to the Firestore collection
    return await this.keys.doc(key).set({
      requests: 0,
      lastUsed: new Date(),
      status,
      endpoints,
      uid,
    });
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
    endpoints,
    requests,
  }: {
    key: string;
    status?: APIKeyStatus;
    endpoints?: string[] | 'all';
    requests?: number;
  }): Promise<WriteResult> {
    // values to update
    const valuesToUpdate = {
      ...(status && {status}),
      ...(endpoints && {endpoints: endpoints}),
      ...(requests && {requests}),
    };
    // Update the API key in the Firestore collection
    return await this.keys.doc(key).update(valuesToUpdate);
  }

  /**
   * Retrieves the record associated with an API key.
   * @param key - The API key to retrieve.
   * @returns The record associated with the API key.
   */
  async getKey(key: string): Promise<APIKeyRecord | undefined> {
    const keyRef = await this.keys.doc(key).get();
    return keyRef.data() as APIKeyRecord;
  }

  /**
   * Deletes an API key from the store.
   * @param key - The API key to delete.
   * @returns A boolean indicating whether the API key was deleted successfully.
   */
  async deleteKey(key: string): Promise<WriteResult> {
    return await this.keys.doc(key).delete();
  }

  /**
   * Increments the number of requests made using an API key.
   * @param key - The API key to increment requests for.
   * @returns A boolean indicating whether the requests were incremented successfully.
   * @throws Throws an error if the API key is not found.
   */
  async incrementRequests(key: string): Promise<WriteResult> {
    // Increment the requests count for the API key
    return await this.keys.doc(key).update({
      requests: FieldValue.increment(1),
      lastUsed: new Date(),
    });
  }
}
