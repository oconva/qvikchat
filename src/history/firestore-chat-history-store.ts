import { MessageData } from "@genkit-ai/ai/model";
import { app } from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { ChatHistoryCollection, ChatHistoryStore } from "./chat-history-store";

/**
 * Configuration for the Firebase chat history store.
 */
export type FirestoreChatHistoryStoreConfig = {
  firebaseApp: app.App;
  collectionName: string;
};

/**
 * Firebase Firestore chat history store for managing chat history.
 */
export class FirestoreChatHistoryStore implements ChatHistoryStore {
  /**
   * Reference to the collection in Firestore where chat history is stored.
   */
  collectionRef: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;

  /**
   * The collection of chat history records.
   */
  history: ChatHistoryCollection = new Map();

  /**
   * Initializes a new instance of the FirebaseChatHistoryStore class.
   * @param config - Configuration for the Firebase chat history store.
   */
  constructor(config: FirestoreChatHistoryStoreConfig) {
    // initialize Firestore collection reference
    this.collectionRef = config.firebaseApp
      .firestore()
      .collection(config.collectionName);
  }

  /**
   * Adds a new chat history to the store.
   * @param messages - Optional. The messages to add to the chat history.
   * @returns Returns the chat ID of the new chat history.
   */
  async addChatHistory(messages?: MessageData[]): Promise<string> {
    // add chat history to Firestore
    const newChatHistory = await this.collectionRef.add({
      messages: messages || [],
      lastUpdated: new Date(),
    });
    // return chatId
    return newChatHistory.id;
  }

  /**
   * Updates an existing chat history in the store.
   * Overwrites the existing messages with the new messages.
   * @param chatId - The ID of the chat history to update.
   * @param messages - The messages to add to the chat history.
   * @throws Error if unable to update chat history.
   */
  async updateChatHistory(
    chatId: string,
    messages: MessageData[]
  ): Promise<void> {
    // update firestore chat history
    await this.collectionRef.doc(chatId).update({
      messages: messages,
      lastUpdated: new Date(),
    });
  }

  /**
   * Adds messages to an existing chat history in the store.
   * @param chatId - The ID of the chat history to update.
   * @param messages - The messages to add to the chat history.
   * @throws Error if unable to add messages to chat history.
   */
  async addMessages(chatId: string, messages: MessageData[]): Promise<void> {
    // add message to chat history
    await this.collectionRef.doc(chatId).update({
      messages: FieldValue.arrayUnion(...messages),
      lastUpdated: new Date(),
    });
  }

  /**
   * Retrieves the chat history for a given chat ID.
   * @param chatId - The ID of the chat history to retrieve.
   * @returns Returns the chat history as an array of MessageData objects. Returns undefined if the chat history is not found.
   * @throws Throws an error if the conversation with the specified ID is not found.
   */
  async getChatHistory(chatId: string): Promise<MessageData[] | undefined> {
    // get chat history from Firestore
    const chatHistory = await this.collectionRef.doc(chatId).get();
    if (!chatHistory.exists) {
      throw new Error(`Chat history with ID ${chatId} not found.`);
    }
    // return messages
    const data = chatHistory.data();
    return data ? (data.messages as MessageData[]) : undefined;
  }

  /**
   * Deletes the chat history for a given chat ID.
   * @param chatId - The ID of the chat history to delete.
   * @throws Throws an error if the conversation with the specified ID is not found.
   */
  async deleteChatHistory(chatId: string): Promise<void> {
    // delete chat history from Firestore
    const chatHistory = await this.collectionRef.doc(chatId).get();
    if (!chatHistory.exists) {
      throw new Error(`Chat history with ID ${chatId} not found.`);
    }
    await this.collectionRef.doc(chatId).delete();
  }
}
