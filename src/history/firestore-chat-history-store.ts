import { MessageData } from '@genkit-ai/ai/model';
import { generateAlphaNumericString } from '../utils/utils';
import { ChatHistoryCollection, ChatHistoryStore } from './chat-history-store';

/**
 * Configuration for the Firebase chat history store.
 */
export type FirebaseChatHistoryStoreConfig = {
	collectionName: string;
};

/**
 * Firebase Firestore chat history store for managing chat history.
 */
export class FirestoreChatHistoryStore implements ChatHistoryStore {
	/**
	 * Name of the collection in Firestore where chat history is stored.
	 */
	collectionName: string;
	/**
	 * The collection of chat history records.
	 */
	history: ChatHistoryCollection = new Map();

	/**
	 * Initializes a new instance of the FirebaseChatHistoryStore class.
	 * @param config - Configuration for the Firebase chat history store.
	 */
	constructor(config: FirebaseChatHistoryStoreConfig) {
		this.collectionName = config.collectionName;
	}

	/**
	 * Adds a new chat history to the store.
	 * @param messages - Optional. The messages to add to the chat history.
	 * @returns Returns the chat ID of the new chat history.
	 */
	async addChatHistory(messages?: MessageData[]): Promise<string> {
		// generate new chat ID - alpha numeric 16-bits
		const chatId = generateAlphaNumericString();
		// add new ChatHistoryRecord to the history
		this.history.set(chatId, {
			messages: messages || [],
			lastUpdated: new Date(),
		});
		// return chatId
		return chatId;
	}

	/**
	 * Updates an existing chat history in the store.
	 * Overwrites the existing messages with the new messages.
	 * @param chatId - The ID of the chat history to update.
	 * @param messages - The messages to add to the chat history.
	 * @throws Throws an error if the conversation with the specified ID is not found.
	 */
	async updateChatHistory(
		chatId: string,
		messages: MessageData[]
	): Promise<boolean> {
		// get chat history record
		const chatHistoryRecord = this.history.get(chatId);
		// if chat history record is valid
		if (chatHistoryRecord) {
			// update chat history record with new messages
			chatHistoryRecord.messages = messages;
			chatHistoryRecord.lastUpdated = new Date();
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Adds messages to an existing chat history in the store.
	 * @param chatId - The ID of the chat history to update.
	 * @param messages - The messages to add to the chat history.
	 */
	async addMessages(
		chatId: string,
		messages: MessageData[]
	): Promise<boolean> {
		// get chat history record
		const chatHistoryRecord = this.history.get(chatId);
		// if chat history record is valid, add messages to the conversation
		if (chatHistoryRecord) {
			chatHistoryRecord.messages.push(...messages);
			chatHistoryRecord.lastUpdated = new Date();
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Retrieves the chat history for a given chat ID.
	 * @param chatId - The ID of the chat history to retrieve.
	 * @returns Returns the chat history as an array of MessageData objects.
	 * @throws Throws an error if the conversation with the specified ID is not found.
	 */
	async getChatHistory(chatId: string): Promise<MessageData[] | undefined> {
		// get chat history record
		const chatHistoryRecord = this.history.get(chatId);
		// if chat history record is valid, return chat history
		return chatHistoryRecord ? chatHistoryRecord.messages : undefined;
	}

	/**
	 * Deletes the chat history for a given chat ID.
	 * @param chatId - The ID of the chat history to delete.
	 * @throws Throws an error if the conversation with the specified ID is not found.
	 */
	async deleteChatHistory(chatId: string): Promise<boolean> {
		// if chatId present in history, delete chat history
		return this.history.delete(chatId);
	}
}
