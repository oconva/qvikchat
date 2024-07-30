import {
  defineChatEndpoint,
  type DefineChatEndpointConfig,
} from './endpoints/endpoints';
import {
  runServer,
  setupGenkit,
  type SetupGenkitConfig,
  type StartServerParamsType,
  type FirestorePluginParams,
} from './core/core';

// export core modules
export {
  runServer,
  setupGenkit,
  type SetupGenkitConfig,
  type StartServerParamsType,
  type FirestorePluginParams,
};

/**
 * Parameters for `configureAndRunServer` method.
 *
 * @param endpointConfigs list of endpoint configurations to define. `defineChatEndpoint` method will be called for each of these configurations before the server is started.
 * @param genkitConfig Genkit configuration to setup Genkit. If not provided, default Genkit configuration will be used.
 * @param serverConfig server configuration to start the server. If not provided, default server configuration will be used.
 */
export type ConfigureAndRunServerParams = {
  endpointConfigs: DefineChatEndpointConfig[];
  genkitConfig?: SetupGenkitConfig;
  serverConfig?: StartServerParamsType;
};

/**
 * Method to define chat endpoints for the given list of endpoint configurations and then start the server. Also, takes in the Genkit configuration and server configuration.
 * @param endpointConfigs list of endpoint configurations to define. `defineChatEndpoint` method will be called for each of these configurations before the server is started.
 * @param genkitConfig Genkit configuration to setup Genkit. If not provided, default Genkit configuration will be used.
 * @param serverConfig server configuration to start the server. If not provided, default server configuration will be used.
 */
export async function configureAndRunServer({
  endpointConfigs,
  genkitConfig,
  serverConfig,
}: ConfigureAndRunServerParams) {
  // setup Genkit
  setupGenkit(genkitConfig);

  // define all chat endpoints using the provided endpoint configurations
  for (const endpointConfig of endpointConfigs) {
    defineChatEndpoint(endpointConfig);
  }

  // start the server
  runServer(serverConfig);
}
