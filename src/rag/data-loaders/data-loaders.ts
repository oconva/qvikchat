import {TextLoader} from 'langchain/document_loaders/fs/text';
import {JSONLoader} from 'langchain/document_loaders/fs/json';
import {CSVLoader} from '@langchain/community/document_loaders/fs/csv';
import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf';
import {Document} from 'langchain/document';

/**
 * Supported data loader types.
 */
export type SupportedDataLoaderTypes = 'text' | 'json' | 'csv' | 'code' | 'pdf';

/**
 * Supported file extensions for data loaders.
 */
export const supportedFileExtensions: {[key: string]: string[]} = {
  cpp: ['cpp', 'cxx', 'cc'],
  go: ['go'],
  java: ['java'],
  js: ['js', 'mjs', 'cjs'],
  php: ['php'],
  proto: ['proto'],
  python: ['py'],
  rst: ['rst'],
  ruby: ['rb'],
  rust: ['rs'],
  scala: ['scala'],
  swift: ['swift'],
  markdown: ['md', 'markdown', 'mdx'],
  latex: ['tex', 'ltx'],
  html: ['html', 'htm'],
  sol: ['sol'],
  text: ['txt'],
  json: ['json'],
  pdf: ['pdf'],
  csv: ['csv'],
};

/**
 * Keys to include when loading JSON data.
 */
export type JSONLoaderKeysToInclude = string | string[];

/**
 * Options for loading CSV data.
 */
export type CSVLoaderOptions = {
  column?: string;
  separator?: string;
};

/**
 * Options for loading PDF data.
 */
export type PDFLoaderOptions = {
  splitPages?: boolean | undefined;
  pdfjs?:
    | (() => Promise<{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getDocument: any;
        version: string;
      }>)
    | undefined;
  parsedItemSeparator?: string | undefined;
};

/**
 * Validate the data type of the file based on the file extension.
 * @param filePath path to the data file from which the file type is inferred using the file extension
 * @returns is supported type: dataType and isSupported as true, else unsupported type: unSupportedDataType and isSupported as false
 */
export function validateDataType(filePath: string):
  | {
      dataType: SupportedDataLoaderTypes;
      isSupported: true;
    }
  | {
      unSupportedDataType: string;
      isSupported: false;
    } {
  // Validate the file path and extract the file extension
  const extension = filePath.split('.').pop();
  if (!extension) {
    return {unSupportedDataType: '', isSupported: false};
  }

  // Normalize the extracted file extension to lowercase
  const fileExtension = extension.toLowerCase();

  // Check if the extracted file extension is in any of the supported extensions lists
  if (fileExtension) {
    for (const [fileType, extensions] of Object.entries(
      supportedFileExtensions
    )) {
      if (extensions.includes(fileExtension)) {
        if (
          fileType === 'text' ||
          fileType === 'json' ||
          fileType === 'pdf' ||
          fileType === 'csv'
        ) {
          return {dataType: fileType, isSupported: true};
        } else {
          return {dataType: 'code', isSupported: true};
        }
      }
    }
  }
  return {unSupportedDataType: fileExtension, isSupported: false};
}

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
 */
export const getDocs = async (
  dataLoaderType: SupportedDataLoaderTypes,
  path: string,
  jsonLoaderKeysToInclude?: JSONLoaderKeysToInclude,
  csvLoaderOptions?: CSVLoaderOptions,
  pdfLoaderOptions?: PDFLoaderOptions
): Promise<Document<Record<string, string>>[]> => {
  // store loader
  let loader;
  // infer loader to use based on dataLoaderType
  switch (dataLoaderType) {
    case 'text':
    case 'code':
      loader = new TextLoader(path);
      break;
    case 'json':
      loader = new JSONLoader(path, jsonLoaderKeysToInclude);
      break;
    case 'csv':
      loader = new CSVLoader(path, csvLoaderOptions);
      break;
    case 'pdf':
      loader = new PDFLoader(path, pdfLoaderOptions);
      break;
    default:
      throw new Error(`Unsupported data loader type: ${dataLoaderType}`);
  }
  // load data and return documents
  return await loader.load();
};
