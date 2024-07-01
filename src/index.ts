import dotenv from 'dotenv';
import { configureGenkit } from '@genkit-ai/core';
import { startFlowsServer } from '@genkit-ai/flow';
import { googleAI } from '@genkit-ai/googleai';
import { dotprompt } from '@genkit-ai/dotprompt';
import { GLOBAL_CONFIG } from './config';
import { langchain } from 'genkitx-langchain';
import { defineTestFlows } from '/test-flows';

// Load environment variables
dotenv.config();

// Configure Genkit
configureGenkit({
	plugins: [
		googleAI({
			apiKey: process.env.GOOGLE_GENAI_API_KEY,
		}),
		dotprompt(),
		langchain({}),
	],
	logLevel: GLOBAL_CONFIG.genkitConfig?.logLevel || 'warn',
	enableTracingAndMetrics:
		GLOBAL_CONFIG.genkitConfig?.enableTracingAndMetrics || true,
});

// Define test flows
defineTestFlows();

// Start the flows server with global configurations
startFlowsServer(GLOBAL_CONFIG.startFlowsServerParams);
