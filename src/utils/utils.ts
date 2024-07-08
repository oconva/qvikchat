import { MessageData } from "@genkit-ai/ai/model";
import * as crypto from "crypto";
import { config as dotenvConfig } from "dotenv";
import { resolve as pathResolve } from "path";

export function generateAlphaNumericString(
  bytes: number = 32,
  encoding: crypto.Encoding = "base64"
) {
  return crypto.randomBytes(bytes).toString(encoding);
}

export function generateHash(data: string, algorithm: string = "sha256") {
  return crypto.createHash(algorithm).update(data).digest("hex");
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
  let chatHistory = "<chat_history>\n";
  for (const message of messages) {
    if (
      message.content &&
      message.content.length > 0 &&
      message.content[0].text
    ) {
      chatHistory += `<chat_history_item>${message.role}: ${message.content[0].text}</chat_history_item>\n`;
    }
  }
  chatHistory += "</chat_history>";
  return chatHistory;
}

export function getEnvironmentVariable(name: string, envFileName?: string) {
  // Certain Deno setups will throw an error if you try to access environment variables
  // https://github.com/langchain-ai/langchainjs/issues/1412
  try {
    dotenvConfig({
      path: pathResolve(envFileName ?? ".env"),
    });
    return typeof process !== "undefined"
      ? // eslint-disable-next-line no-process-env
        process.env?.[name]
      : undefined;
  } catch (e) {
    throw new Error(`Error getting environment variable. ${e}`);
  }
}
