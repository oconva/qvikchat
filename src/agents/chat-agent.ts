import { generate } from '@genkit-ai/ai';
import type { GenerateResponse } from '@genkit-ai/ai';
import { ChatHistoryStore } from '../history/chat-history-store';
import { InMemoryChatHistoryStore } from '../history/in-memory-chat-history-store';
import { ModelConfig, SupportedModels } from '../models/model';
import {
	closeEndedSystemPrompt,
	openEndedSystemPrompt,
	ragSystemPrompt,
} from '../prompts/system-prompts';
import { MessageData } from '@genkit-ai/ai/model';
import { ToolArgument } from '@genkit-ai/ai/tool';
import { Dotprompt } from '@genkit-ai/dotprompt';

/**
 * Represents the type of chat agent.
 */
export type ChatAgentType = 'open-ended' | 'close-ended' | 'rag';

/**
 * Represents the configuration for the agent type.
 * @property agentType - The type of agent.
 * @property topic - The topic for the agent type.
 */
export type AgentTypeConfig =
	| {
			agentType?: 'open-ended';
	  }
	| {
			agentType: 'close-ended' | 'rag';
			topic: string;
	  };

/**
 * Represents the configuration for the chat agent.
 *
 * @property agentType - The type of agent.
 * @property topic - The topic for the chat agent.
 * @property systemPrompt - The system prompt for the chat agent.
 * @property chatPrompt - The chat prompt for the chat agent.
 * @property enableChatHistory - Indicates whether to use chat history.
 * @property chatHistoryStore - The chat history store.
 * @property tools - Tools for the chat agent.
 * @property model - The supported model to use for chat completion.
 * @property modelConfig - The model configuration.
 */
export type ChatAgentConfig = {
	systemPrompt?: Dotprompt;
	chatPrompt?: Dotprompt;
	enableChatHistory?: boolean;
	chatHistoryStore?: ChatHistoryStore;
	tools?: ToolArgument[];
	model?: SupportedModels;
	modelConfig?: ModelConfig;
} & AgentTypeConfig;

/**
 * Represents the default chat agent configuration.
 */
export const defaultChatAgentConfig: ChatAgentConfig = {
	agentType: 'open-ended',
	enableChatHistory: false,
	model: 'gemini15Flash',
};

/**

 * Represents the attributes of the chat agent.
 */
export interface ChatAgentAttributes {
	agentType?: ChatAgentType;
	topic?: string;
	systemPrompt?: Dotprompt;
	chatPrompt?: Dotprompt;
	enableChatHistory: boolean;
	chatHistoryStore: ChatHistoryStore;
	model?: SupportedModels;
	modelConfig?: ModelConfig;
}

/**
 * Represents the properties for generating a response.
 *
 * @property query - The query string.
 * @property context - The context object.
 * @property chatId - The ID of the chat history.
 * @property history - The chat history.
 * @property tools - The tool arguments.
 * @property model - The supported model.
 * @property modelConfig - The model configuration.
 * @property systemPrompt - The system prompt.
 * @property chatPrompt - The chat prompt.
 */
export type GenerateResponseProps = {
	query: string;
	context?: any;
	chatId?: string;
	history?: MessageData[];
	tools?: ToolArgument[];
	model?: SupportedModels;
	modelConfig?: ModelConfig;
	systemPrompt?: Dotprompt;
	chatPrompt?: Dotprompt;
};

/**
 * Represents the return object for generating a response.
 *
 * @property chatId - The ID of the chat history.
 * @property res - The generated response.
 */
export type GenerateResponseReturnObj = {
	chatId?: string;
	res: GenerateResponse;
};

/**
 * Represents the methods of the chat agent.
 */

export interface ChatAgentMethods {
	/**
	 * Generates a response based on the given properties.
	 * @param props - The properties for generating the response.
	 * @returns Returns a promise that resolves to the generated response.
	 */
	generateResponse: (
		props: GenerateResponseProps
	) => Promise<GenerateResponseReturnObj>;

	/**
	 * Retrieves the chat history for a given chat ID.iven chat ID.
	 * @param chatId - The ID of the chat history to retrieve.
	 * @returns Returns a promise that resolves to the chat history for the given chat ID if available, otherwise returns undefined.
	 */
	getChatHistory: (chatId: string) => Promise<MessageData[] | undefined>;
}

/**
 * Represents the interface of the chat agent.
 */
export interface ChatAgentInterface
	extends ChatAgentAttributes,
		ChatAgentMethods {}

type GenerateSystemPromptResponseParams = {
	agentType?: ChatAgentType;
	prompt: Dotprompt;
	model?: SupportedModels;
	modelConfig?: ModelConfig;
	query?: string;
	context?: string;
	topic?: string;
	tools?: ToolArgument[];
};

/**
 * Represents the chat agent class.
 */
export class ChatAgent implements ChatAgentInterface {
	agentType?: ChatAgentType = defaultChatAgentConfig.agentType;
	topic?: string;
	systemPrompt?: Dotprompt;
	chatPrompt?: Dotprompt;
	enableChatHistory: boolean;
	chatHistoryStore: ChatHistoryStore;
	tools?: ToolArgument[];
	model?: SupportedModels;
	modelConfig?: ModelConfig;

	/**
	 * Creates a new instance of the chat agent.
	 * @param agentType - The type of agent.
	 * @param topic - The topic for the agent type.
	 * @param systemPrompt - The system prompt for the chat agent.
	 * @param chatPrompt - The chat prompt for the chat agent.
	 * @param enableChatHistory - Indicates whether to use chat history.
	 * @param chatHistoryStore - The chat history store.
	 * @param tools - Tools for the chat agent.
	 * @param model - The supported model. If not provided, will use the default model (e.g. Gemini 1.5 Flash).
	 * @param modelConfig - The model configuration.
	 */
	constructor(config: ChatAgentConfig = defaultChatAgentConfig) {
		this.agentType = config.agentType ?? defaultChatAgentConfig.agentType;
		this.systemPrompt = config.systemPrompt;
		this.chatPrompt = config.chatPrompt;
		this.enableChatHistory = config.enableChatHistory ?? false;
		this.chatHistoryStore =
			config.chatHistoryStore ?? new InMemoryChatHistoryStore();
		this.tools = config.tools;
		this.model = config.model;
		this.modelConfig = config.modelConfig;
	}

	/**
	 * Gets the system prompt based on the agent type.
	 * @param agentType - The type of agent.
	 * @returns Returns the system prompt.
	 * @throws Throws an error if the agent type is invalid.
	 */
	private static getSystemPrompt(agentType?: ChatAgentType) {
		// get the system prompt based on the agent type
		switch (agentType) {
			case 'open-ended':
				return openEndedSystemPrompt;
			case 'close-ended':
				return closeEndedSystemPrompt;
			case 'rag':
				return ragSystemPrompt;
			default:
				throw new Error('Invalid agent type');
		}
	}

	/**
	 * Gets the formatted input based on the agent type.
	 * @param agentType - The type of agent.
	 * @param topic - Topic for close-ended and rag agents.
	 * @param query - The query string.
	 * @param context - The context object.
	 * @returns Returns the formatted input.
	 * @throws Throws an error if the agent type is invalid.
	 */
	private static getFormattedInput(
		agentType?: ChatAgentType,
		query?: string,
		topic?: string,
		context?: any
	) {
		switch (agentType) {
			case 'open-ended':
				return {
					query,
				};
			case 'close-ended':
				return {
					query,
					topic: topic,
				};
			case 'rag':
				return {
					query,
					topic: topic,
					context,
				};
			default:
				throw new Error('Invalid agent type');
		}
	}

	/**
	 * Generates a response using the system prompt.
	 * @param agentType - The type of agent.
	 * @param model - The supported model.
	 * @param modelConfig - The model configuration.
	 * @param query - The query string.
	 * @param context - The context string.
	 * @param topic - The topic string.
	 * @param tools - The tool arguments.
	 * @returns Returns the generated response.
	 */
	private static generateSystemPromptResponse({
		agentType,
		prompt,
		model,
		modelConfig,
		query,
		context,
		topic,
		tools,
	}: GenerateSystemPromptResponseParams) {
		// generate the response
		const res = prompt.generate({
			model: model, // if undefined, will use model defined in the dotprompt
			config: modelConfig,
			input: ChatAgent.getFormattedInput(
				agentType,
				query,
				context,
				topic
			),
			tools: tools,
		});
		// return the response
		return res;
	}

	/**
	 * Generates a response based on the given properties.
	 * @param query - The query string.
	 * @param context - The context string.
	 * @param chatId - The chat ID.
	 * @param history - The chat history.
	 * @param tools - The tool arguments.
	 * @param model - The supported model.
	 * @param modelConfig - The model configuration.
	 * @returns Returns a promise that resolves to the generated response.
	 * @throws Throws an error if chat history enabled but the chat history store is not initialized or if no data is found for the chat ID.
	 */
	async generateResponse({
		query,
		context,
		chatId,
		history,
		tools,
		model,
		modelConfig,
		systemPrompt,
		chatPrompt,
	}: GenerateResponseProps): Promise<GenerateResponseReturnObj> {
		// System prompt to use
		// In order of priority: systemPrompt provided as argument to generateResponse, this.systemPrompt, default system prompt
		const prompt =
			systemPrompt ??
			this.systemPrompt ??
			ChatAgent.getSystemPrompt(this.agentType);
		// if not using chat history
		if (!this.enableChatHistory) {
			// return response in specified format
			return {
				res: await ChatAgent.generateSystemPromptResponse({
					agentType: this.agentType,
					prompt,
					model: model ?? this.model,
					modelConfig: modelConfig ?? this.modelConfig,
					query,
					context,
					topic: this.topic,
					tools: tools ?? this.tools,
				}),
			};
		}
		// if using chat history, confirm chat history store is initialized
		if (!this.chatHistoryStore)
			throw new Error('Chat history store not initialized');
		// if no chatID provided
		if (!chatId) {
			// generate response for given query (will use system prompt)
			const res = await ChatAgent.generateSystemPromptResponse({
				agentType: this.agentType,
				prompt,
				model: model ?? this.model,
				modelConfig: modelConfig ?? this.modelConfig,
				query,
				context,
				topic: this.topic,
				tools: tools ?? this.tools,
			});
			// add chat history and obtain new chat ID
			chatId = await this.chatHistoryStore.addChatHistory(
				res.toHistory()
			);
			// return response in specified format
			return {
				chatId,
				res,
			};
		}
		// retrieve chat history if not provided already
		const chatHistory =
			history ?? (await this.chatHistoryStore.getChatHistory(chatId));
		// if no chat history provided and no chat history found for the given chat ID
		if (!chatHistory)
			throw new Error(`No data found for chat ID ${chatId}.`);
		// generate response for given query (will use chat prompt and chat history)
		const res = await generate({
			model: model ?? this.model,
			prompt: query,
			history: chatHistory,
			tools,
		});
		// update chat history with new messages (user query and model response)
		await this.chatHistoryStore.addMessages(
			chatId,
			res.toHistory().slice(-2)
		);
		// return response in specified format
		return {
			chatId,
			res,
		};
	}

	/**
	 * Retrieves the chat history for a given chat ID.
	 * @param chatId - The ID of the chat history to retrieve.
	 * @returns Returns a promise that resolves to the chat history for the given chat ID if available, otherwise returns undefined.
	 */
	async getChatHistory(chatId: string): Promise<MessageData[] | undefined> {
		if (!this.enableChatHistory || !this.chatHistoryStore) return undefined;
		return await this.chatHistoryStore.getChatHistory(chatId);
	}
}
