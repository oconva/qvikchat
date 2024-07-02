import { MessageData } from '@genkit-ai/ai/model';

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
 * @property {ChatHistoryCollection} history - The collection of chat history records.
 * @property {(messages?: MessageData[]) => Promise<string>} addChatHistory - Adds a new chat history to the store.
 * @property {(chatId: string, messages: MessageData[]) => Promise<boolean>} updateChatHistory - Updates an existing chat history in the store.
 * @property {(chatId: string, messages: MessageData[]) => Promise<boolean>} addMessages - Adds messages to an existing chat history in the store.
 * @property {(chatId: string) => Promise<MessageData[] | undefined>} getChatHistory - Retrieves the chat history for a given chat ID.
 * @property {(chatId: string) => Promise<boolean>} deleteChatHistory - Deletes the chat history for a given chat ID.
 */
export interface ChatHistoryStore {
	history: ChatHistoryCollection;
	addChatHistory: (messages?: MessageData[]) => Promise<string>;
	updateChatHistory: (
		chatId: string,
		messages: MessageData[]
	) => Promise<boolean>;
	addMessages: (chatId: string, messages: MessageData[]) => Promise<boolean>;
	getChatHistory: (chatId: string) => Promise<MessageData[] | undefined>;
	deleteChatHistory: (chatId: string) => Promise<boolean>;
}
