import {APIKeyStore} from './api-key-store';

export type APIKeyAuthPolicyParams = {
  key: string | undefined;
  uid: string;
  endpoint: string;
  apiKeyStore: APIKeyStore | undefined;
};

/**
 * API key authentication policy.
 * Confirm that the API key is valid and active, and that the user ID matches the API key's user ID.
 * @param key API key being used for authentication
 * @param uid User ID provided in the request (should be the owner of the API key)
 * @param endpoint Endpoint being accessed
 * @param apiKeyStore API key store instance
 * @throws Throws an error if the API key is missing, not found, disabled, or if the user ID does not match the API key's user ID, or if the requests limit has been breached, or if the endpoint is not allowed for the API key, or if the API key store is not initialized.
 */
export const apiKeyAuthPolicy = async ({
  key,
  uid,
  endpoint,
  apiKeyStore,
}: APIKeyAuthPolicyParams) => {
  if (!key) {
    throw new Error('Authorization required. Missing API key.');
  }

  if (!apiKeyStore) {
    throw new Error('Authorization failed. API key store not initialized.');
  }

  // get API key record from API key store
  const apiKey = await apiKeyStore.getKey(key);
  // check if API key exists
  if (apiKey) {
    if (apiKey.status === 'disabled') {
      throw new Error('Authorization failed. API key is disabled.');
    } else {
      // check if the user ID matches the API key's user ID
      if (apiKey.uid !== uid) {
        throw new Error('Authorization failed. Invalid user ID.');
      }
      // confirm that the requests limit has not been breached, if any
      if (apiKey.requestsLimit && apiKey.requests >= apiKey.requestsLimit) {
        throw new Error(
          'Authorization failed. Requests limit exceeded for the provided API key.'
        );
      }

      // confirm that the endpoint is allowed for the API key
      if (apiKey.endpoints !== 'all' && !apiKey.endpoints.includes(endpoint)) {
        throw new Error(
          'Authorization failed. Endpoint not allowed for the provided API key.'
        );
      }
      // increment requests count
      apiKeyStore.incrementRequests(key);
    }
  } else {
    throw new Error(`Authorization failed. API key not found ${key}.`);
  }
};
