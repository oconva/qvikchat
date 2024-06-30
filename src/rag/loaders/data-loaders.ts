import { TextLoader } from 'langchain/document_loaders/fs/text';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';

/**
 * Supported data loader types.
 */
export type SupportedDataLoaderTypes = 'text' | 'json' | 'csv';

/**
 * Keys to include when loading JSON data.
 */
type JSONLoaderKeysToInclude = string | string[];

/**
 * Options for loading CSV data.
 */
type CSVLoaderOptions = {
	column?: string;
	separator?: string;
};

/**
 * Get documents from a file path using a data loader.
 *
 * @param dataLoaderType Type of data being load. Choose from one of the supported data types.
 * @param path Path to the file to load (local, from root).
 * @param jsonLoaderKeysToInclude Optional. Keys to include when loading JSON data.
 * @param csvLoaderOptions Optional. Options for loading CSV data.
 * @returns Documents from the file.
 *
 * For more data loaders, see:
 * @link https://js.langchain.com/v0.1/docs/integrations/document_loaders/
 * For JSON Loader
 * @link https://js.langchain.com/v0.1/docs/modules/data_connection/document_loaders/json/#using-json-pointer-example
 */
export const getDocs = async (
	dataLoaderType: SupportedDataLoaderTypes,
	path: string,
	jsonLoaderKeysToInclude?: JSONLoaderKeysToInclude,
	csvLoaderOptions?: CSVLoaderOptions
) => {
	// store loader
	let loader;
	// infer loader to use based on dataLoaderType
	switch (dataLoaderType) {
		case 'text':
			loader = new TextLoader(path);
			break;
		case 'json':
			loader = new JSONLoader(path, jsonLoaderKeysToInclude);
			break;
		case 'csv':
			loader = new CSVLoader(path, csvLoaderOptions);
			break;
		default:
			throw new Error(`Unsupported data loader type: ${dataLoaderType}`);
	}
	// load data and return documents
	return await loader.load();
};
