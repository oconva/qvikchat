import type {CorsOptions} from 'cors';
import {
  type ConfigOptions,
  type PluginProvider,
  configureGenkit,
} from '@genkit-ai/core';
import {startFlowsServer} from '@genkit-ai/flow';
import {googleAI} from '@genkit-ai/googleai';
import {dotprompt} from '@genkit-ai/dotprompt';
import {openAI} from 'genkitx-openai';
import {getEnvironmentVariable} from '../utils/utils';
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
 * Configures Genkit with a set of options. This should be called from `genkit.configig.js`.
 */
export type SetupGenkitConfig = ConfigOptions;

/**
 * Required plugins for Genkit setup.
 */
const requiredPlugins: PluginProvider[] = [dotprompt()];

/**
 * Function to check if a plugin exists in the list of plugins.
 * @param name name of the plugin
 * @param plugins list of plugins
 * @returns true if plugin exists in the list of plugins, false otherwise
 */
function pluginExists(name: string, plugins: PluginProvider[]) {
  return plugins.some((plugin) => plugin.name === name);
}

/**
 * Setup Genkit with the provided configurations.
 * @param config Configurations for Genkit setup.
 */
export const setupGenkit = (config: SetupGenkitConfig = {}) => {
  // if plugins provided, add them to the required plugins
  if (config.plugins) {
    requiredPlugins.push(...config.plugins);
  }
  // check if googleAI or openAI plugin is already added by user in provided plugins
  if (
    !pluginExists('googleAI', requiredPlugins) &&
    !pluginExists('openAI', requiredPlugins)
  ) {
    // check at least one of the API keys is provided
    if (
      !getEnvironmentVariable('GOOGLE_GENAI_API_KEY') &&
      !getEnvironmentVariable('OPENAI_API_KEY')
    ) {
      throw new Error(
        'At least one of the API keys (GOOGLE_GENAI_API_KEY or OPENAI_API_KEY) is required to be set in the `.env` file.'
      );
    }
    // depending on the API keys provided, add the respective plugin
    if (getEnvironmentVariable('GOOGLE_GENAI_API_KEY')) {
      requiredPlugins.push(
        googleAI({
          apiKey: getEnvironmentVariable('GOOGLE_GENAI_API_KEY'),
        })
      );
    }
    if (getEnvironmentVariable('OPENAI_API_KEY')) {
      requiredPlugins.push(
        openAI({
          apiKey: getEnvironmentVariable('OPENAI_API_KEY'),
        })
      );
    }
  }
  // Configure Genkit
  configureGenkit({
    plugins: requiredPlugins,
    logLevel: config.logLevel ?? GLOBAL_CONFIG.genkitConfig?.logLevel ?? 'warn',
    enableTracingAndMetrics:
      config.enableTracingAndMetrics ??
      GLOBAL_CONFIG.genkitConfig?.enableTracingAndMetrics ??
      true,
  });
};

/**
 * Method to run the server that will serve the chat endpoints.
 * @param params parameters for running the server
 */
export const runServer = (params: StartServerParamsType = {}) => {
  // Start the flows server with global configurations
  startFlowsServer(params ?? GLOBAL_CONFIG.startServerParams);
};
