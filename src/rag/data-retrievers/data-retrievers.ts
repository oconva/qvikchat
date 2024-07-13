import {MemoryVectorStore} from 'langchain/vectorstores/memory';
import {GoogleGenerativeAIEmbeddings} from '@langchain/google-genai';
import {formatDocumentsAsString} from 'langchain/util/document';
import {Runnable, RunnableConfig} from '@langchain/core/runnables';
import {EmbeddingsInterface} from '@langchain/core/embeddings';
import {
  VectorStore,
  VectorStoreRetrieverInput,
} from '@langchain/core/vectorstores';
import {Document} from 'langchain/document';
import {
  CSVLoaderOptions,
  JSONLoaderKeysToInclude,
  PDFLoaderOptions,
  SupportedDataLoaderTypes,
  getDocs,
} from '../data-loaders/data-loaders';
import {
  ChunkingConfig,
  DataSplitterConfig,
  SupportedDataSplitterTypes,
  runDataSplitter,
} from '../data-splitters/data-splitters';
import {GOOGLE_GENAI_EMBEDDING_MODELS} from '../data-embeddings/embedding-models';
import {getEnvironmentVariable} from '../../utils/utils';

/**
 * Type denoting a retriever that retrieves text data.
 */
export type TextDataRetriever = Runnable<string, string, RunnableConfig>;

/**
 * Retrieval options for the retriever.
 */
export type RetrievalOptions =
  | number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | Partial<VectorStoreRetrieverInput<any>>
  | undefined;

/**
 * Represents the configuration for the retriever when generating embeddings.
 * @property {SupportedDataLoaderTypes} dataType - The type of data loader to use.
 * @property {string} filePath - The path to the file containing the data.
 * @property {Document<Record<string, string>>[]} [docs] - Optional: Provide an array containing LangChain document objects for the data.
 * @property {Document<Record<string, unknown>>[]} [splitDocs] - Optional: Provide an array containing LangChain document objects for the split data.
 * @property {JSONLoaderKeysToInclude} [jsonLoaderKeysToInclude] - The keys to include when loading JSON data.
 * @property {CSVLoaderOptions} [csvLoaderOptions] - The options for loading CSV data.
 * @property {PDFLoaderOptions} [pdfLoaderOptions] - The options for loading PDF data.
 * @property {SupportedDataSplitterTypes} [dataSplitterType] - The type of data splitter to use.
 * @property {ChunkingConfig} [chunkingConfig] - The configuration for chunking the data.
 * @property {DataSplitterConfig} [splitterConfig] - The configuration for the data splitter.
 * @property {RetrievalOptions} [retrievalOptions] - The retrieval options for the retriever.
 * @property {VectorStore} [vectorStore] - The vector store to use.
 * @property {EmbeddingsInterface} [embeddingModel] - The embedding model to use.
 * @property {boolean} generateEmbeddings - Whether to generate embeddings.
 */
export type RetrieverConfigGeneratingEmbeddings = {
  dataType: SupportedDataLoaderTypes;
  filePath: string;
  docs?: Document<Record<string, string>>[];
  splitDocs?: Document<Record<string, unknown>>[];
  jsonLoaderKeysToInclude?: JSONLoaderKeysToInclude;
  csvLoaderOptions?: CSVLoaderOptions;
  pdfLoaderOptions?: PDFLoaderOptions;
  dataSplitterType?: SupportedDataSplitterTypes;
  chunkingConfig?: ChunkingConfig;
  splitterConfig?: DataSplitterConfig;
  retrievalOptions?: RetrievalOptions;
  vectorStore?: VectorStore;
  embeddingModel?: EmbeddingsInterface;
  generateEmbeddings: true;
};

/**
 * Represents the configuration for the retriever when not generating embeddings.
 * @property {VectorStore} vectorStore - The vector store to use.
 * @property {RetrievalOptions} [retrievalOptions] - The retrieval options for the retriever.
 * @property {boolean} generateEmbeddings - Whether to generate embeddings.
 */
export type RetrieverConfigNotGeneratingEmbeddings = {
  generateEmbeddings: false;
  vectorStore: VectorStore;
  retrievalOptions?: RetrievalOptions;
};

/**
 * Represents the configuration for the retriever.
 */
export type RetrieverConfig =
  | RetrieverConfigGeneratingEmbeddings
  | RetrieverConfigNotGeneratingEmbeddings;

/**
 * From @google/generative-ai
 * Task type for embedding content.
 */
export enum TaskType {
  TASK_TYPE_UNSPECIFIED = 'TASK_TYPE_UNSPECIFIED',
  RETRIEVAL_QUERY = 'RETRIEVAL_QUERY',
  RETRIEVAL_DOCUMENT = 'RETRIEVAL_DOCUMENT',
  SEMANTIC_SIMILARITY = 'SEMANTIC_SIMILARITY',
  CLASSIFICATION = 'CLASSIFICATION',
  CLUSTERING = 'CLUSTERING',
}

/**
 * Get a default data splitter based on the data type.
 * Will split CSV and JSON data by using new line as the separator.
 * For all other data types, will use a RecursiveCharacterTextSplitter by default.
 * @param dataType type of data to be split
 * @returns appropriate data splitter based on the data type
 */
export const getAppropriateDataSplitter = (
  dataType: SupportedDataLoaderTypes
): {
  defaultDataSplitterType: SupportedDataSplitterTypes;
  defaultSplitterConfig?: DataSplitterConfig;
} => {
  switch (dataType) {
    case 'csv':
    case 'json':
      return {
        defaultDataSplitterType: 'character',
        defaultSplitterConfig: {
          textSplitterConfig: {
            separators: ['\n'],
          },
        },
      };
    default:
      return {
        defaultDataSplitterType: 'text',
      };
  }
};

/**
 * Default chunking configuration.
 */
export const defaultChunkingConfig: ChunkingConfig = {
  chunkSize: 1000,
  chunkOverlap: 200,
};

/**
 * Method to ingest data, split it into chunks, generate embeddings and store them in a vector store.
 * If not generating embeddings, simply returns a runnable instance to retrieve docs as string.
 * Returns a runnable instance to retrieve docs as string.
 * @returns LangChain runnable instance to retrieve docs as string.
 */
export const getDataRetriever = async (
  config: RetrieverConfig
): Promise<Runnable<string, string, RunnableConfig>> => {
  // if not generating embeddings
  if (!config.generateEmbeddings) {
    // vector store must be provided
    if (!config.vectorStore)
      throw new Error(
        'Vector store must be provided when not generating embeddings'
      );
    // return retriever
    else
      return config.vectorStore
        .asRetriever(config.retrievalOptions)
        .pipe(formatDocumentsAsString);
  }

  // if generating embeddings, data type must be provided
  if (!config.dataType) {
    throw new Error(
      'Data type and file path must be provided when generating embeddings'
    );
  }

  // if generating embeddings, file path must be provided
  if (!config.filePath || config.filePath === '') {
    throw new Error('Invalid file path. File path must be provided');
  }

  try {
    // Retrieve the documents from the specified file path
    const docs: Document<Record<string, string>>[] =
      config.docs ?? (await getDocs(config.dataType, config.filePath));

    const {defaultDataSplitterType, defaultSplitterConfig} =
      getAppropriateDataSplitter(config.dataType);

    // Split the retrieved documents into chunks using the data splitter
    const splitDocs: Document<Record<string, unknown>>[] =
      config.splitDocs ??
      (await runDataSplitter({
        docs,
        dataSplitterType: config.dataSplitterType ?? defaultDataSplitterType,
        chunkingConfig: config.chunkingConfig ?? defaultChunkingConfig,
        splitterConfig: config.splitterConfig ?? defaultSplitterConfig,
      }));

    // embedding model - if not provided, use the default Google Generative AI Embeddings model
    const embeddings: EmbeddingsInterface =
      config.embeddingModel ??
      new GoogleGenerativeAIEmbeddings({
        apiKey: getEnvironmentVariable('GOOGLE_GENAI_API_KEY'),
        model: GOOGLE_GENAI_EMBEDDING_MODELS['text-embedding-004'].name,
        taskType: TaskType.RETRIEVAL_DOCUMENT,
      });

    // create a vector store instance
    const vectorStore: VectorStore =
      config.vectorStore ?? new MemoryVectorStore(embeddings);
    // add documents to the vector store
    await vectorStore.addDocuments(splitDocs);
    // switch the embedding model to a retrieval query task if the default model is being used
    vectorStore.embeddings =
      config.embeddingModel ??
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
        model: GOOGLE_GENAI_EMBEDDING_MODELS['text-embedding-004'].name,
        taskType: TaskType.RETRIEVAL_QUERY,
      });

    // return the vector store as a retriever and pipe the documents to the formatDocumentsAsString function
    return vectorStore
      .asRetriever(config.retrievalOptions)
      .pipe(formatDocumentsAsString);
  } catch (error) {
    throw new Error(`Failed to get data retriever: ${error}`);
  }
};
