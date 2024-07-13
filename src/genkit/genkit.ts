import {ConfigOptions, PluginProvider, configureGenkit} from '@genkit-ai/core';
import {startFlowsServer} from '@genkit-ai/flow';
import {googleAI} from '@genkit-ai/googleai';
import {dotprompt} from '@genkit-ai/dotprompt';
import {firebase} from '@genkit-ai/firebase';
import {TelemetryConfig} from '@genkit-ai/google-cloud';
import {GLOBAL_CONFIG, StartServerParamsType} from '../config/config';
import {langchain} from 'genkitx-langchain';
import {openAI} from 'genkitx-openai';
import {getEnvironmentVariable} from '../utils/utils';

/**
 * Configuration for Firebase plugin.
 */
export interface FirestorePluginParams {
  projectId?: string;
  flowStateStore?: {
    collection?: string;
    databaseId?: string;
  };
  traceStore?: {
    collection?: string;
    databaseId?: string;
  };
  telemetryConfig?: TelemetryConfig;
}

/**
 * Configures Genkit with a set of options. This should be called from `genkit.configig.js`.
 */
export type SetupGenkitConfig = {
  firebaseConfig?: FirestorePluginParams;
} & ConfigOptions;

/**
 * Required plugins for Genkit setup.
 */
const requiredPlugins: PluginProvider[] = [dotprompt(), langchain({})];

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
  // configure firebase if configurations provided
  if (config.firebaseConfig) {
    // if firebase already added by user in provided plugins, then don't add it again
    // will only add if firebase plugin is not already added
    if (!pluginExists('firebase', requiredPlugins)) {
      requiredPlugins.push(
        firebase({
          ...config.firebaseConfig,
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
