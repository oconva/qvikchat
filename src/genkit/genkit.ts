import {
  ConfigOptions,
  PluginProvider,
  configureGenkit,
} from "@genkit-ai/core";
import { startFlowsServer } from "@genkit-ai/flow";
import { googleAI } from "@genkit-ai/googleai";
import { dotprompt } from "@genkit-ai/dotprompt";
import { firebase } from "@genkit-ai/firebase";
import { TelemetryConfig } from "@genkit-ai/google-cloud";
import { GLOBAL_CONFIG, StartServerParamsType } from "../config/config";
import { langchain } from "genkitx-langchain";
import { openAI } from "genkitx-openai";
import { getEnvironmentVariable } from "../utils/utils";

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
const requiredPlugins: PluginProvider[] = [
  googleAI({
    apiKey: getEnvironmentVariable("GOOGLE_GENAI_API_KEY"),
  }),
  dotprompt(),
  langchain({}),
  openAI({
    apiKey: getEnvironmentVariable("OPENAI_API_KEY"),
  }),
];

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
  // configure firebase if configurations provided
  if (config.firebaseConfig) {
    // if firebase already added by user in provided plugins, then don't add it again
    // will only add if firebase plugin is not already added
    if (!pluginExists("firebase", requiredPlugins)) {
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
    logLevel: config.logLevel ?? GLOBAL_CONFIG.genkitConfig?.logLevel ?? "warn",
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
