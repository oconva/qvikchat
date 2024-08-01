import type {CorsOptions} from 'cors';
import {startFlowsServer} from '@genkit-ai/flow';
import {GLOBAL_CONFIG} from '../config/config';

/**
 * Type for the parameters to start the server
 */
export type StartServerParamsType = {
  port?: number;
  cors?: CorsOptions;
  pathPrefix?: string;
};

/**
 * Method to run the server that will serve the chat endpoints.
 * @param params parameters for running the server
 */
export const runServer = (params: StartServerParamsType = {}) => {
  // Start the flows server with global configurations
  startFlowsServer(params ?? GLOBAL_CONFIG.startServerParams);
};
