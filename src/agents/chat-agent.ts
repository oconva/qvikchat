import { generate } from '@genkit-ai/ai';
import type { GenerateResponse } from '@genkit-ai/ai';
import { ChatHistoryStore } from '../data/chat-history/chat-history-store';
import { InMemoryChatHistoryStore } from '../data/chat-history/in-memory-chat-history-store';
import { ModelConfig, SupportedModels, useModel } from '../models/use-model';
import {
	closeEndedSystemPrompt,
	openEndedSystemPrompt,
	ragSystemPrompt,
} from '../prompts/system-prompts';
import { MessageData } from '@genkit-ai/ai/model';
import { ToolArgument } from '@genkit-ai/ai/tool';

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
			agentType: 'open-ended';
	  }
	| {
			agentType: 'close-ended' | 'rag';
			topic: string;
	  };

/**
 * Represents the configuration for the chat agent.
 *
 * @property agentTypeConfig - The configuration for the agent type.
 * @property topic - The topic for the chat agent.
 * @property systemPrompt - The system prompt for the chat agent.
 * @property chatPrompt - The chat prompt for the chat agent.
 * @property useChatHistory - Indicates whether to use chat history.
 * @property historyStore - The chat history store.
 * @property tools - Tools for the chat agent.
 * @property model - The supported model to use for chat completion.
 * @property modelConfig - The model configuration.
 */
export type ChatAgentConfig = {
	agentTypeConfig?: AgentTypeConfig;
	topic?: string;
	systemPrompt?: string;
	chatPrompt?: string;
	useChatHistory?: boolean;
	historyStore?: ChatHistoryStore;
	tools?: ToolArgument[];
	model?: SupportedModels;
	modelConfig?: ModelConfig;
};

/**
 * Represents the default agent type configuration.
 */

export const defaultAgentTypeConfig: AgentTypeConfig = {
	agentType: 'open-ended',
};

/**

 * Represents the default chat agent configuration.
 */
export const defaultChatAgentConfig: ChatAgentConfig = {
	agentTypeConfig: defaultAgentTypeConfig,
	useChatHistory: false,
};

/**

 * Represents the attributes of the chat agent.
 */
export interface ChatAgentAttributes {
	agentTypeConfig: AgentTypeConfig;
	useChatHistory: boolean;
	historyStore: ChatHistoryStore;
	model?: SupportedModels;
	modelConfig?: ModelConfig;
}

/**
 * Represents the properties for generating a response.
 */
export type GenerateResponseProps = {
	query: string;
	context?: any;
	chatId?: string;
	history?: MessageData[];
	tools?: ToolArgument[];
	model?: SupportedModels;
	modelConfig?: ModelConfig;
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

/**
 * Represents the chat agent class.
 */
export class ChatAgent implements ChatAgentInterface {
	agentTypeConfig: AgentTypeConfig;
	useChatHistory: boolean;
	historyStore: ChatHistoryStore;
	tools?: ToolArgument[];
	model?: SupportedModels;
	modelConfig?: ModelConfig;

	/**
	 * Creates a new instance of the chat agent.
	 * @param agentTypeConfig - The configuration for the agent type.
	 * @param useChatHistory - Indicates whether to use chat history.
	 * @param historyStore - The chat history store.
	 * @param model - The supported model.
	 * @param modelConfig - The model configuration.
	 */
	constructor({
		agentTypeConfig = defaultChatAgentConfig.agentTypeConfig,
		useChatHistory = defaultChatAgentConfig.useChatHistory,
		historyStore,
		tools,
		model = defaultChatAgentConfig.model,
		modelConfig = defaultChatAgentConfig.modelConfig,
	}: ChatAgentConfig = defaultChatAgentConfig) {
		this.agentTypeConfig = agentTypeConfig ?? defaultAgentTypeConfig;
		this.useChatHistory = useChatHistory ?? false;
		this.historyStore = historyStore ?? new InMemoryChatHistoryStore();
		this.tools = tools;
		this.model = model;
		this.modelConfig = modelConfig;
	}

	/**
	 * Gets the system prompt based on the agent type.
	 * @param agentTypeConfig - The configuration for the agent type.
	 * @returns Returns the system prompt.
	 * @throws Throws an error if the agent type is invalid.
	 */
	private static getSystemPrompt(agentTypeConfig: AgentTypeConfig) {
		// get the system prompt based on the agent type
		switch (agentTypeConfig.agentType) {
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
	 * @param agentTypeConfig - The configuration for the agent type.
	 * @param query - The query string.
	 * @param context - The context object.
	 * @returns Returns the formatted input.
	 * @throws Throws an error if the agent type is invalid.
	 */
	private static getFormattedInput(
		agentTypeConfig: AgentTypeConfig,
		query?: string,
		context?: any
	) {
		switch (agentTypeConfig.agentType) {
			case 'open-ended':
				return {
					query,
				};
			case 'close-ended':
				return {
					query,
					topic: agentTypeConfig.topic,
				};
			case 'rag':
				return {
					query,
					topic: agentTypeConfig.topic,
					context,
				};
			default:
				throw new Error('Invalid agent type');
		}
	}

	/**
	 * Generates a response using the system prompt.
	 * @param agentTypeConfig - The configuration for the agent type.
	 * @param model - The supported model.
	 * @param modelConfig - The model configuration.
	 * @param query - The query string.
	 * @param context - The context string.
	 * @param tools - The tool arguments.
	 * @returns Returns the generated response.
	 */
	private static generateSystemPromptResponse(
		agentTypeConfig: AgentTypeConfig,
		model?: SupportedModels,
		modelConfig?: ModelConfig,
		query?: string,
		context?: string,
		tools?: ToolArgument[]
	) {
		// get system prompt to use
		const prompt = ChatAgent.getSystemPrompt(agentTypeConfig);
		// generate the response
		const res = prompt.generate({
			model: model, // if undefined, will use model defined in the dotprompt
			config: modelConfig,
			input: ChatAgent.getFormattedInput(agentTypeConfig, query, context),
			tools: tools,
		});
		// return the response
		return res;
	}

	/**
	 * Generates a response based on the given properties.
	 * @param props - The properties for generating the response.
	 * @returns Returns a promise that resolves to the generated response.
	 * @throws Throws an error if the chat history store is not initialized or if no data is found for the chat ID.
	 */
	async generateResponse({
		query,
		context,
		chatId,
		history,
		tools,
		model,
		modelConfig,
	}: GenerateResponseProps): Promise<GenerateResponseReturnObj> {
		// if not using chat history
		if (!this.useChatHistory) {
			// return response in specified format
			return {
				res: await ChatAgent.generateSystemPromptResponse(
					this.agentTypeConfig,
					model ?? this.model,
					modelConfig ?? this.modelConfig,
					query,
					context,
					tools ?? this.tools
				),
			};
		}
		// if using chat history, confirm chat history store is initialized
		if (!this.historyStore)
			throw new Error('Chat history store not initialized');
		// if no chatID provided
		if (!chatId) {
			// generate response for given query (will use system prompt)
			const res = await ChatAgent.generateSystemPromptResponse(
				this.agentTypeConfig,
				model ?? this.model,
				modelConfig ?? this.modelConfig,
				query,
				context,
				tools ?? this.tools
			);
			// add chat history and obtain new chat ID
			chatId = await this.historyStore.addChatHistory(res.toHistory());
			// return response in specified format
			return {
				chatId,
				res,
			};
		}
		// retrieve chat history if not provided already
		const chatHistory =
			history ?? (await this.historyStore.getChatHistory(chatId));
		// if no chat history provided and no chat history found for the given chat ID
		if (!chatHistory)
			throw new Error(`No data found for chat ID ${chatId}.`);
		// model to use
		const llm = useModel(
			model ?? this.model,
			modelConfig ?? this.modelConfig
		);
		// generate response for given query (will use chat prompt and chat history)
		const res = await generate({
			model: llm,
			prompt: query,
			history: chatHistory,
			tools,
		});
		// update chat history with new messages (user query and model response)
		await this.historyStore.addMessages(chatId, res.toHistory().slice(-2));
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
		if (!this.useChatHistory || !this.historyStore) return undefined;
		return await this.historyStore.getChatHistory(chatId);
	}
}
