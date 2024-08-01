import {EmbeddingsInterface} from '@langchain/core/embeddings';
import {GoogleGenerativeAIEmbeddings} from '@langchain/google-genai';
import {TaskType} from '../data-retrievers/data-retrievers';
import {
  type AzureOpenAIInput,
  type OpenAIEmbeddingsParams,
  OpenAIEmbeddings,
} from '@langchain/openai';

/**
 * Text embedding models supported by Google GenAI.
 */
export const GOOGLE_GENAI_EMBEDDING_MODELS = {
  'embedding-001': {
    name: 'embedding-001',
    dimensions: 768,
    max_input_tokens: 2048,
  },
  'text-embedding-004': {
    name: 'text-embedding-004',
    dimensions: 768,
    max_input_tokens: 2048,
  },
};

/**
 * Text embedding models supported by OpenAI.
 */
export const OPENAI_EMBEDDING_MODELS = {
  'text-embedding-3-small': {
    name: 'text-embedding-3-small',
    dimensions: 1536,
    max_input_tokens: 8191,
  },
  'text-embedding-3-large': {
    name: 'text-embedding-3-large',
    min_dimensions: 256,
    dimensions: 3072,
    max_input_tokens: 8191,
  },
  'text-embedding-ada-002': {
    name: 'text-embedding-ada-002',
    dimensions: 1536,
    max_input_tokens: 8191,
  },
};

/**
 * Supported embedding models
 */
export const EmbeddingModels = {...GOOGLE_GENAI_EMBEDDING_MODELS};

/**
 * Names of the supported embedding models.
 */
export type EmbeddingModelName = keyof typeof EmbeddingModels;

export type getEmbeddingModelParams =
  | {
      modelName?: EmbeddingModelName;
    }
  | {
      /**
       * Name of the model to use. Must be one of the supported models.
       */
      modelName: keyof typeof GOOGLE_GENAI_EMBEDDING_MODELS;
      /**
       * Type of task for which the embedding will be used
       *
       * Note: currently only supported by `embedding-001` model
       */
      taskType?: TaskType;
      /**
       * An optional title for the text. Only applicable when TaskType is
       * `RETRIEVAL_DOCUMENT`
       *
       * Note: currently only supported by `embedding-001` model
       */
      title?: string;
      /**
       * Whether to strip new lines from the input text. Default to true
       */
      stripNewLines?: boolean;
      /**
       * Google API key to use
       */
      apiKey?: string;
    }
  | {
      /**
       * Name of the model to use. Must be one of the supported models.
       */
      modelName?: keyof typeof OPENAI_EMBEDDING_MODELS;
      /**
       * Configuration for the OpenAIEmbeddings model.
       */
      config?: Partial<OpenAIEmbeddingsParams> & Partial<AzureOpenAIInput>;
    };

/**
 * Method to get the an embedding model. Currently only supports GoogleGenerativeAIEmbeddings and OpenAIEmbeddings models.
 * For using any other model, please create a new instance of the model and use it.
 * Check link below to see the list of embedding models available through LangChain.
 * @link https://js.langchain.com/v0.1/docs/integrations/text_embedding/
 * @returns embedding model - if no model name provided, returns GoogleGenerativeAIEmbeddings with text-embedding-004 model
 */
export const getEmbeddingModel = (
  params?: getEmbeddingModelParams
): EmbeddingsInterface => {
  // if model name provided
  if (params && params.modelName) {
    // if model name one of Google GenAI models
    if (params.modelName in GOOGLE_GENAI_EMBEDDING_MODELS) {
      return new GoogleGenerativeAIEmbeddings({
        model: params.modelName,
        taskType: 'taskType' in params ? params.taskType : undefined,
        title: 'title' in params ? params.title : undefined,
        stripNewLines:
          'stripNewLines' in params ? params.stripNewLines : undefined,
        apiKey: 'apiKey' in params ? params.apiKey : undefined,
      });
    }

    // if model name one of OpenAI models
    if (params.modelName in OPENAI_EMBEDDING_MODELS) {
      return new OpenAIEmbeddings(
        'config' in params ? params.config : undefined
      );
    }
  }

  // default model to return
  return new GoogleGenerativeAIEmbeddings({
    model: 'text-embedding-004',
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });
};
