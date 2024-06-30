import { gemini15Pro, gemini15Flash, geminiPro } from '@genkit-ai/googleai';

/**
 * List of supported models
 */
export type SupportedModels =
	| 'googleai/gemini-pro-vision'
	| 'googleai/gemini-1.5-pro-latest'
	| 'googleai/gemini-1.5-flash-latest'
	| 'googleai/gemini-1.0-pro-latest';

/**
 * Supported configuration options for a model
 */
export type ModelConfig = {
	version?: string | undefined;
	temperature?: number | undefined;
	maxOutputTokens?: number | undefined;
	topK?: number | undefined;
	topP?: number | undefined;
	stopSequences?: string[] | undefined;
	safetySettings?:
		| {
				category:
					| 'HARM_CATEGORY_UNSPECIFIED'
					| 'HARM_CATEGORY_HATE_SPEECH'
					| 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
					| 'HARM_CATEGORY_HARASSMENT'
					| 'HARM_CATEGORY_DANGEROUS_CONTENT';
				threshold:
					| 'BLOCK_LOW_AND_ABOVE'
					| 'BLOCK_MEDIUM_AND_ABOVE'
					| 'BLOCK_ONLY_HIGH'
					| 'BLOCK_NONE';
		  }[]
		| undefined;
};

/**
 * Function to configure a model with the given configuration
 * @param model model to configure
 * @param config model configuration object
 * @returns
 */
function configureModel(
	model: typeof gemini15Pro | typeof gemini15Flash | typeof geminiPro,
	config: ModelConfig
) {
	// add properties given in the config object to the model object
	Object.assign(model, config);
	return model;
}

/**
 * Function to get a model, and optionally configure it with the given configuration
 * @param model name of model to get
 * @param config model configuration object
 * @returns instance of the model with the given configurations
 */
export const useModel = (model?: SupportedModels, config?: ModelConfig) => {
	switch (model) {
		case 'googleai/gemini-1.5-pro-latest':
			return config ? configureModel(gemini15Pro, config) : gemini15Pro;
		case 'googleai/gemini-1.5-flash-latest':
			return config
				? configureModel(gemini15Flash, config)
				: gemini15Flash;
		case 'googleai/gemini-1.0-pro-latest':
			return config ? configureModel(geminiPro, config) : geminiPro;
		default:
			return gemini15Flash;
	}
};
