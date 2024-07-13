import {MessageData} from '@genkit-ai/ai/model';
import {CollectionReference} from 'firebase-admin/firestore';

/**
 * Represents a record of chat history.
 */
export type ChatHistoryRecord = {
  messages: MessageData[];
  lastUpdated?: Date;
};

/**
 * Represents a collection of chat history records.
 */
export type ChatHistoryCollection = Map<string, ChatHistoryRecord>;

/**
 * Represents a store for managing chat history.
 *
 * @interface ChatHistoryStore
 *
 * @property {ChatHistoryCollection | CollectionReference} history - The collection of chat history records.
 * @property {(messages?: MessageData[]) => Promise<string>} addChatHistory - Adds a new chat history to the store.
 * @property {(chatId: string, messages: MessageData[]) => Promise<boolean> | Promise<void>} updateChatHistory - Updates an existing chat history in the store.
 * @property {(chatId: string, messages: MessageData[]) => Promise<boolean> | Promise<void>} addMessages - Adds messages to an existing chat history in the store.
 * @property {(chatId: string) => Promise<MessageData[] | undefined>} getChatHistory - Retrieves chat history from the store.
 * @property {(chatId: string) => Promise<boolean> | Promise<void>} deleteChatHistory - Deletes chat history from the store.
 */
export interface ChatHistoryStore {
  /**
   * The collection of chat history records.
   */
  history: ChatHistoryCollection | CollectionReference;
  /**
   * Add new chat history to the store. Returns chat ID of the new chat history.
   * @param messages add new chat history to the store
   * @returns chat ID of the new chat history
   */
  addChatHistory: (messages?: MessageData[]) => Promise<string>;
  /**
   * Update existing chat history in the store. Overwrites existing messages with new messages.
   * @param chatId ID of the chat history to update
   * @param messages messages to add to the chat history
   * @throws Error if unable to update chat history
   */
  updateChatHistory: (
    chatId: string,
    messages: MessageData[]
  ) => Promise<boolean> | Promise<void>;
  /**
   * Add messages to an existing chat history in the store.
   * @param chatId ID of the chat history to update
   * @param messages messages to add to the chat history
   * @throws Error if unable to add messages to chat history
   */
  addMessages: (
    chatId: string,
    messages: MessageData[]
  ) => Promise<boolean> | Promise<void>;
  /**
   * Get chat history from the store for the specified chat ID.
   * @param chatId Chat ID for the chat history to retrieve
   * @returns Array of messages pretaining to the chat history
   * @throws Error if unable to retrieve chat history
   */
  getChatHistory: (chatId: string) => Promise<MessageData[]>;
  /**
   * Delete chat history from the store for the specified chat ID.
   * @param chatId Chat ID for the chat history to delete
   * @throws Error if unable to delete chat history
   * @returns Promise that resolves when chat history is deleted
   */
  deleteChatHistory: (chatId: string) => Promise<boolean> | Promise<void>;
}

// export supported chat history stores
export {InMemoryChatHistoryStore} from './in-memory-chat-history-store';
export {
  FirestoreChatHistoryStore,
  type FirestoreChatHistoryStoreConfig,
} from './firestore-chat-history-store';
