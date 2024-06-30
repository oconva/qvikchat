import path from 'path';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { formatDocumentsAsString } from 'langchain/util/document';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
import { getDocs } from '../loaders/data-loaders';
import { runDataSplitter } from '../splitters/data-splitters';
import { GOOGLE_GENAI_EMBEDDING_MODELS } from '../embeddings/embedding-models';
import { RetrieverConfig, TaskType } from './retriever';
import dotenv from 'dotenv';

// Load environment variables needed for API key for the embedding model
dotenv.config();

/**
 * Use the inventory data indexer to index the inventory data documents.
 * Retrieves documents from a file and splits them into chunks.
 * @returns LangChain runnable instance to retrieve docs as string.
 */
export const getInventoryDataRetriever = async (
	{ retrievalOptions }: RetrieverConfig = {
		retrievalOptions: undefined,
	}
): Promise<Runnable<string, string, RunnableConfig>> => {
	try {
		// Specify the file path of the document to be loaded
		const filePath = path.resolve(
			'lib/rag/knowledge-bases/test-retail-store-kb/inventory-data.csv'
		);

		// Retrieve the documents from the specified file path
		const docs = await getDocs('csv', filePath);
		// Split the retrieved documents into chunks using the data splitter
		const splitDocs = await runDataSplitter(
			docs,
			'text',
			{
				chunkSize: 1000,
				chunkOverlap: 200,
			},
			{
				textSplitterConfig: {
					separators: ['\n'],
				},
			}
		);

		// embedding model
		const embeddingModel = new GoogleGenerativeAIEmbeddings({
			apiKey: process.env.GOOGLE_GENAI_API_KEY,
			model: GOOGLE_GENAI_EMBEDDING_MODELS['text-embedding-004'].name,
			taskType: TaskType.RETRIEVAL_DOCUMENT,
		});

		// create a vector store instance
		const vectorStore = new MemoryVectorStore(embeddingModel);
		// add documents to the vector store
		await vectorStore.addDocuments(splitDocs);
		// switch the embedding model to a retrieval query task
		vectorStore.embeddings = new GoogleGenerativeAIEmbeddings({
			apiKey: process.env.GOOGLE_GENAI_API_KEY,
			model: GOOGLE_GENAI_EMBEDDING_MODELS['text-embedding-004'].name,
			taskType: TaskType.RETRIEVAL_QUERY,
		});

		// return the vector store as a retriever and pipe the documents to the formatDocumentsAsString function
		return vectorStore
			.asRetriever(retrievalOptions)
			.pipe(formatDocumentsAsString);
	} catch (error) {
		throw new Error(`Error loading inventory data indexer: ${error}`);
	}
};
