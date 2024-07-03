import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { EmbeddingsInterface } from '@langchain/core/embeddings';
import {
	VectorStore,
	VectorStoreRetrieverInput,
} from '@langchain/core/vectorstores';
import {
	CSVLoaderOptions,
	JSONLoaderKeysToInclude,
	PDFLoaderOptions,
	SupportedDataLoaderTypes,
} from '../loaders/data-loaders';
import {
	ChunkingConfig,
	DataSplitterConfig,
	SupportedDataSplitterTypes,
} from '../splitters/data-splitters';

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
