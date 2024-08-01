import type {Document} from '@langchain/core/documents';
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
  type SupportedTextSplitterLanguage,
  type TextSplitterChunkHeaderOptions,
} from 'langchain/text_splitter';

/**
 * Represents the supported types of data splitters.
 */
export type SupportedDataSplitterTypes = 'character' | 'text' | 'json' | 'code';

/**
 * Represents the configuration for chunking data.
 */
export type ChunkingConfig = {
  chunkSize?: number;
  chunkOverlap?: number;
  keepSeparator?: boolean;
  lengthFunction?:
    | ((text: string) => number)
    | ((text: string) => Promise<number>);
};

/**
 * Represents the configuration for code splitters.
 */
export type CodeSplitterConfig = {
  fromLanguage: SupportedTextSplitterLanguage;
};

export type TextSplitterParams = {
  chunkSize?: number;
  chunkOverlap?: number;
  keepSeparator?: boolean;
  separators?: string[];
};

/**
 * Represents the configuration for data splitters.
 */
export interface DataSplitterConfig {
  textSplitterConfig?: TextSplitterParams;
  codeSplitterConfig?: CodeSplitterConfig;
  chunkHeaderOptions?: TextSplitterChunkHeaderOptions;
}

/**
 * Represents the parameters for the data splitter.
 */
export type DataSplitterParams = {
  docs: Document[];
  dataSplitterType: SupportedDataSplitterTypes;
  chunkingConfig?: ChunkingConfig;
  splitterConfig?: DataSplitterConfig;
};

/**
 * Runs the data splitter on the provided documents.
 * @param docs The documents to be split.
 * @param dataSplitterType The type of data splitter to be used.
 * @param chunkingConfig The configuration for chunking data.
 * @param splitterConfig The configuration for the data splitter.
 * @returns array containing splits of the given documents.
 */
export const runDataSplitter = async ({
  docs,
  dataSplitterType,
  chunkingConfig,
  splitterConfig,
}: DataSplitterParams) => {
  let splitter;

  switch (dataSplitterType) {
    case 'character':
      splitter = new CharacterTextSplitter({
        ...chunkingConfig,
        ...splitterConfig?.textSplitterConfig,
      });
      break;
    case 'text':
      splitter = new RecursiveCharacterTextSplitter({
        ...chunkingConfig,
        ...splitterConfig?.textSplitterConfig,
      });
      break;

    case 'code':
      if (!splitterConfig || !splitterConfig.codeSplitterConfig) {
        throw new Error(
          'Code splitter config is required for code data splitter'
        );
      }
      splitter = RecursiveCharacterTextSplitter.fromLanguage(
        splitterConfig.codeSplitterConfig.fromLanguage,
        chunkingConfig
      );
      break;
    default:
      throw new Error(`Unsupported data splitter type: ${dataSplitterType}`);
  }

  return await splitter.splitDocuments(
    docs,
    splitterConfig?.chunkHeaderOptions
  );
};
