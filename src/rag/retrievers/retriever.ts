import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { VectorStoreRetrieverInput } from '@langchain/core/vectorstores';

/**
 * RetrieveDocs is a function that retrieves documents from a database.
 */
export type RetrieveDocs = (query: string, options?: any) => Promise<any>;

/**
 * Type denoting a retriever that retrieves text data.
 */
export type TextDataRetriever = Runnable<string, string, RunnableConfig>;

/**
 * Retrieval options for the retriever.
 */
export type RetrievalOptions =
	| number
	| Partial<VectorStoreRetrieverInput<any>>
	| undefined;

/**
 * Represents the configuration for the retriever.
 */
export type RetrieverConfig = {
	retrievalOptions: RetrievalOptions;
};

/**
 * From @google/generative-ai
 * Task type for embedding content.
 */
export declare enum TaskType {
	TASK_TYPE_UNSPECIFIED = 'TASK_TYPE_UNSPECIFIED',
	RETRIEVAL_QUERY = 'RETRIEVAL_QUERY',
	RETRIEVAL_DOCUMENT = 'RETRIEVAL_DOCUMENT',
	SEMANTIC_SIMILARITY = 'SEMANTIC_SIMILARITY',
	CLASSIFICATION = 'CLASSIFICATION',
	CLUSTERING = 'CLUSTERING',
}
