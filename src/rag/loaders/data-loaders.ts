import { TextLoader } from "langchain/document_loaders/fs/text";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

/**
 * Supported data loader types.
 */
export type SupportedDataLoaderTypes = "text" | "json" | "csv" | "code" | "pdf";

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
) => {
  // store loader
  let loader;
  // infer loader to use based on dataLoaderType
  switch (dataLoaderType) {
    case "text":
      loader = new TextLoader(path);
      break;
    case "json":
      loader = new JSONLoader(path, jsonLoaderKeysToInclude);
      break;
    case "csv":
      loader = new CSVLoader(path, csvLoaderOptions);
      break;
    case "pdf":
      loader = new PDFLoader(path, pdfLoaderOptions);
      break;
    default:
      throw new Error(`Unsupported data loader type: ${dataLoaderType}`);
  }
  // load data and return documents
  return await loader.load();
};
