import { MessageData } from '@genkit-ai/ai/model';
import * as crypto from 'crypto';

export function generateAlphaNumericString(
	bytes: number = 32,
	encoding: crypto.Encoding = 'base64'
) {
	return crypto.randomBytes(bytes).toString(encoding);
}

export function generateHash(data: string, algorithm: string = 'sha256') {
	return crypto.createHash(algorithm).update(data).digest('hex');
}

/**
 * Given an array of MessageData objects, returns a string containing the chat history in the following format:
 * <chat_history>
 * <chat_history_item>role: text</chat_history_item>
 * ...
 * </chat_history>
 * Note: only includes text messages.
 * @param messages chat history messages
 * @returns a string containing the chat history in a specific format
 */
export function getChatHistoryAsString(messages: MessageData[]): string {
	let chatHistory = '<chat_history>\n';
	for (const message of messages) {
		if (
			message.content &&
			message.content.length > 0 &&
			message.content[0].text
		) {
			chatHistory += `<chat_history_item>${message.role}: ${message.content[0].text}</chat_history_item>\n`;
		}
	}
	chatHistory += '</chat_history>';
	return chatHistory;
}
