import {generate} from '@genkit-ai/ai';
import type {GenerateResponse} from '@genkit-ai/ai';
import {ChatHistoryStore} from '../history/chat-history-store';
import {
  ModelConfig,
  OutputSchemaType,
  SupportedModelNames,
  SupportedModels,
} from '../models/models';
import {
  defaultSystemPrompts,
  getOpenEndedSystemPrompt,
  getCloseEndedSystemPrompt,
  getRagSystemPrompt,
} from '../prompts/system-prompts';
import {MessageData} from '@genkit-ai/ai/model';
import {ToolArgument} from '@genkit-ai/ai/tool';
import {Dotprompt} from '@genkit-ai/dotprompt';
import {PromptOutputSchema} from '../prompts/prompts';
import {dallE3} from 'genkitx-openai';

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
 * @property tools - Tools for the chat agent.
 * @property modelConfig - The model configuration.
 * @property responseOutputSchema - The output schema for the response.
 */
export type ChatAgentConfig = {
  systemPrompt?: Dotprompt;
  chatPrompt?: Dotprompt;
  tools?: ToolArgument[];
  modelConfig?: ModelConfig;
  responseOutputSchema?: OutputSchemaType;
} & AgentTypeConfig;

export type DefaultChatAgentConfigType = {
  agentType: ChatAgentType;
  model: SupportedModels;
};

/**
 * Represents the default chat agent configuration.
 */
export const defaultChatAgentConfig: DefaultChatAgentConfigType = {
  agentType: 'open-ended',
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
  tools?: ToolArgument[];
  modelConfig?: ModelConfig;
  responseOutputSchema?: OutputSchemaType;
}

/**
 * Represents the properties for generating a response with chat history.
 */
export type GenerateResponseHistoryProps =
  | {
      enableChatHistory: true;
      chatId?: string;
      history?: MessageData[];
      chatHistoryStore: ChatHistoryStore;
    }
  | {
      enableChatHistory?: false;
    };

/**
 * Represents the properties for generating a response.
 *
 * @property query - The query string.
 * @property context - The context object.
 * @property chatId - The ID of the chat history.
 * @property history - The chat history.
 * @property enableChatHistory - Indicates whether to use chat history.
 * @property chatHistoryStore - The chat history store.
 * @property tools - The tool arguments.
 * @property modelConfig - The model configuration.
 * @property systemPrompt - The system prompt.
 * @property chatPrompt - The chat prompt.
 */
export type GenerateResponseProps = {
  query: string;
  context?: string;
  chatId?: string;
  tools?: ToolArgument[];
  modelConfig?: ModelConfig;
  systemPrompt?: Dotprompt;
  chatPrompt?: Dotprompt;
  responseOutputSchema?: OutputSchemaType;
} & GenerateResponseHistoryProps;

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
}

/**
 * Represents the interface of the chat agent.
 */
export interface ChatAgentInterface
  extends ChatAgentAttributes,
    ChatAgentMethods {}

export type GenerateSystemPromptResponseParams = {
  agentType?: ChatAgentType;
  prompt: Dotprompt;
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
  tools?: ToolArgument[];
  modelConfig?: ModelConfig;
  responseOutputSchema?: OutputSchemaType;

  /**
   * Creates a new instance of the chat agent.
   * @param agentType - The type of agent.
   * @param topic - The topic for the agent type.
   * @param systemPrompt - The system prompt for the chat agent.
   * @param chatPrompt - The chat prompt for the chat agent.
   * @param enableChatHistory - Indicates whether to use chat history.
   * @param chatHistoryStore - The chat history store.
   * @param tools - Tools for the chat agent.
   * @param modelConfig - The model configuration. If not provided, will use the default model (e.g. Gemini 1.5 Flash).
   */
  constructor(config: ChatAgentConfig = {}) {
    this.agentType = config.agentType ?? defaultChatAgentConfig.agentType;
    if ('topic' in config) {
      this.topic = config.topic;
    }
    this.systemPrompt = config.systemPrompt;
    this.chatPrompt = config.chatPrompt;
    this.tools = config.tools;
    this.modelConfig = config.modelConfig;
    this.responseOutputSchema = config.responseOutputSchema;
  }

  /**
   * Gets the system prompt based on the agent type.
   * @param agentType - The type of agent.
   * @param outputSchema - The output schema for the system prompt.
   * @returns Returns the system prompt.
   * @throws Throws an error if the agent type is invalid.
   */
  private static getSystemPrompt(
    agentType?: ChatAgentType,
    outputSchema?: PromptOutputSchema
  ) {
    // get the system prompt based on the agent type
    switch (agentType) {
      case 'open-ended':
        // if no output schema or output schema is text, return the default open-ended system prompt
        if (!outputSchema || outputSchema.format === 'text') {
          return defaultSystemPrompts.open.text;
        } else if (outputSchema?.format === 'media') {
          return defaultSystemPrompts.open.media;
        } else {
          // if here, response format is JSON, return the open-ended system prompt with the specified output schema
          return getOpenEndedSystemPrompt({
            outputSchema,
          });
        }
      case 'close-ended':
        // if no output schema or output schema is text, return the default close-ended system prompt
        if (!outputSchema || outputSchema.format === 'text') {
          return defaultSystemPrompts.close.text;
        } else if (outputSchema?.format === 'media') {
          return defaultSystemPrompts.close.media;
        } else {
          // if here, response format is JSON, return the close-ended system prompt with the specified output schema
          return getCloseEndedSystemPrompt({
            outputSchema,
          });
        }
      case 'rag':
        // if no output schema or output schema is text, return the default rag system prompt
        if (!outputSchema || outputSchema.format === 'text') {
          return defaultSystemPrompts.rag.text;
        } else if (outputSchema?.format === 'media') {
          return defaultSystemPrompts.rag.media;
        } else {
          // if here, response format is JSON, return the rag system prompt with the specified output schema
          return getRagSystemPrompt({
            outputSchema,
          });
        }
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
  private static getFormattedInput({
    agentType,
    query,
    context,
    topic,
  }: {
    agentType?: ChatAgentType;
    query?: string;
    topic?: string;
    context?: string;
  }) {
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
   * @param model - The supported model name.
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
    modelConfig,
    query,
    context,
    topic,
    tools,
  }: GenerateSystemPromptResponseParams) {
    // generate the response
    const res = prompt.generate({
      // if undefined, will use model defined in the dotprompt
      model:
        SupportedModelNames[modelConfig?.name ?? defaultChatAgentConfig.model],
      config: {...modelConfig},
      input: ChatAgent.getFormattedInput({agentType, query, context, topic}),
      tools: tools,
    });
    // return the response
    return res;
  }

  /**
   * Method to get prompt output schema based on the response type.
   * @param responseOutputSchema Response type specified by user
   * @returns PromptOutputSchema object based on the response type
   */
  static getPromptOutputSchema(
    responseOutputSchema?: OutputSchemaType
  ): PromptOutputSchema {
    if (!responseOutputSchema || responseOutputSchema.format === 'text') {
      return {format: 'text'};
    } else if (responseOutputSchema.format === 'json') {
      return {
        format: 'json',
        schema: responseOutputSchema.schema,
      };
    } else if (responseOutputSchema.format === 'media') {
      return {format: 'media'};
    } else {
      throw new Error(`Invalid response type ${responseOutputSchema.format}`);
    }
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
  async generateResponse(
    params: GenerateResponseProps
  ): Promise<GenerateResponseReturnObj> {
    // if the model being used is Dall-E3 (e.g., for image generation)
    // simply return the response
    if (
      params.modelConfig?.name === 'dallE3' || // if model provided in params is Dall-E3
      (!params.modelConfig?.name && this.modelConfig?.name === 'dallE3') // if model not provided in params and default model is Dall-E3
    ) {
      // configurations for Dall-E3 model
      const dallEConfig = params.modelConfig ?? this.modelConfig;
      // return response
      return {
        res: await generate({
          model: dallE3,
          config: {
            ...dallEConfig,
          },
          prompt: params.query,
          tools: params.tools,
          output: {
            format: 'media',
          },
        }),
      };
    }
    // System prompt to use
    // In order of priority: systemPrompt provided as argument to generateResponse, this.systemPrompt, default system prompt
    const prompt =
      params.systemPrompt ??
      this.systemPrompt ??
      ChatAgent.getSystemPrompt(
        this.agentType,
        ChatAgent.getPromptOutputSchema(
          params.responseOutputSchema ?? this.responseOutputSchema // responseOutputSchema provided as argument takes priority
        )
      );
    // if not using chat history
    if (!params.enableChatHistory) {
      // return response in specified format
      return {
        res: await ChatAgent.generateSystemPromptResponse({
          agentType: this.agentType,
          prompt,
          modelConfig: params.modelConfig ?? this.modelConfig,
          query: params.query,
          context: params.context,
          topic: this.topic,
          tools: params.tools ?? this.tools,
        }),
      };
    }
    // if using chat history, confirm chat history store is initialized
    if (!params.chatHistoryStore)
      throw new Error('Chat history store not initialized');
    // if no chatID provided
    if (!params.chatId) {
      // generate response for given query (will use system prompt)
      const res = await ChatAgent.generateSystemPromptResponse({
        agentType: this.agentType,
        prompt,
        modelConfig: params.modelConfig ?? this.modelConfig,
        query: params.query,
        context: params.context,
        topic: this.topic,
        tools: params.tools ?? this.tools,
      });
      // add chat history and obtain new chat ID
      params.chatId = await params.chatHistoryStore.addChatHistory(
        res.toHistory()
      );
      // return response in specified format
      return {
        chatId: params.chatId,
        res,
      };
    }
    // retrieve chat history if not provided already
    const chatHistory =
      params.history ??
      (await params.chatHistoryStore.getChatHistory(params.chatId));
    // if no chat history provided and no chat history found for the given chat ID
    if (!chatHistory)
      throw new Error(`No data found for chat ID ${params.chatId}.`);
    // generate response for given query (will use chat prompt and any provided chat history, context and tools)
    const res = await generate({
      model:
        SupportedModelNames[
          params.modelConfig?.name ??
            this.modelConfig?.name ??
            defaultChatAgentConfig.model
        ],
      config: {
        ...this.modelConfig,
        ...params.modelConfig,
      },
      prompt: params.query,
      history: chatHistory,
      context: params.context
        ? [{content: [{text: params.context}]}]
        : undefined,
      tools: params.tools,
    });
    // update chat history with new messages (user query and model response)
    await params.chatHistoryStore.addMessages(
      params.chatId,
      res.toHistory().slice(-2)
    );
    // return response in specified format
    return {
      chatId: params.chatId,
      res,
    };
  }
}
