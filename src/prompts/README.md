# Prompts

This folder contains prompts defined using specifically-formatted dotprompt files. You can read more about Dotprompt [here](https://firebase.google.com/docs/genkit/dotprompt.md).

Two types of prompts are available:

-   **System prompts** are the prompts you use to configure your LLM model to behave in a certain way, and inform the LLM model on how the user queries should be handled and answered. These prompts are designed to set the tone of your LLM model and ensure that the LLM model responses are accurate and secure. These will be first prompt you send to the LLM model.
-   **Chat prompts** are the prompts you use for every additional user query in an ongoing chat session or conversation. These prompts are designed to ensure that user queries are secure and that they are handled appropriately.

## Setup

Firebase Genkit provides the Dotprompt plugin to easily integrate and use prompts in your project. To use the Dotprompt plugin, you need to configure Genkit with the Dotprompt plugin.

```typescript
import { dotprompt, prompt } from '@genkit-ai/dotprompt';

configureGenkit({ plugins: [dotprompt()] });
```

## System Prompts

Use these prompts for initial setup of your LLM model. These prompts are designed to ensure that the LLM model responses are accurate and secure.

### Use Cases

-   **Open-Ended System Prompt**: Use this system prompt to allow open-ended conversations with the LLM model.
-   **Closed-Ended System Prompt**: Use this system prompt to allow closed-ended conversations with the LLM model, where the model will only respond to the given user query if it is relevant to a given context.
-   **RAG (Retrieval Augmented Generation) System Prompt**: Use this system prompt to allow the LLM model to generate responses for queries related to a specific topic and only based on the given additional context information.

### Usage

Below is an example of how to use the `openEndedSystemPrompt` system prompt to create a simple unrestricted chatbot.

```typescript
// update the path to the dotprompt file
import { openEndedSystemPrompt } from './prompts/system-prompts';

// generate response using the system prompt
const response = await openEndedSystemPrompt.generate({
	model: model, // if undefined, will use model defined in the dotprompt
	config: modelConfig,
	input: {
		query: 'How can I read multiple documents in Firestore?',
	},
});

// display response
console.log(response.text());
```

## Read More

Firebase Genkit documenation on [Prompts](https://firebase.google.com/docs/genkit/prompts).
