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
