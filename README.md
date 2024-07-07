# QvikChat

Framework to build secure, performant and reliable chat apps and services quickly and efficiently.

Develop a self-hosted production-ready AI-powered chat app or service at a rapid pace with this [Firebase Genkit](https://github.com/firebase/genkit) and [LangChain](https://js.langchain.com/v0.2/docs/introduction/) based framework.

**QvikChat** is a framework that provides you with a solid foundation to build powerful AI-powered chat service endpoints quickly and efficiently. It includes support for **multiple types of conversations (open-ended, close-ended)**, **chat history**, **response caching**, **authentication**, and **information retrieval using Retrieval Augmented Generation (RAG).**

[Get Started](https://qvikchat.pkural.ca/getting-started) | [Documentation](https://qvikchat.pkural.ca) 

## Features

- **Firebase Genkit**: Built using the open source [Firebase Genkit framework](https://firebase.google.com/docs/genkit) to help you build powerful production-ready AI-powered apps or services quickly and efficiently.
- **Deploy to any NodeJS platform**: Deploy your app or service to any NodeJS platform, including Firebase, Google Cloud, AWS, Heroku, etc.
- **LangChain**: Built using the open source [LangChain framework](https://js.langchain.com/v0.2/docs/introduction/) to help you process data for RAG and information retrieval. Easily extend the framework by using any LangChain supported embedding model, vector store, data loader, and more.
- **Dotprompt**: Using [Dotprompt](https://firebase.google.com/docs/genkit/dotprompt) for well-structured prompts with all relevant metadata and input-output data validation.
- **Firebase Firestore**: In-built support for using [Cloud Firestore](https://firebase.google.com/docs/firestore) as chat history store, cache store, and API key store.
- **Chat agents**: Create chat agents with support for chat history, caching, authentication and information retrieval, in a few lines of code.
- **API key protected endpoints**: API Key Store to easily manage API keys and ensure that only authorized users can access your app endpoints.
- **Response Caching**: Cache responses to user queries to improve response times and reduce the number of API calls to LLM.
- **RAG Agents**: Create chat agents that can use Retrieval Augmented Generation (RAG) to answer user queries by retrieving additional context information (e.g. from a text or JSON file).
- **RAG Data Loading**: Built-in support for loading text, JSON, PDF, or code files. Easily add new knowledge bases to create new RAG agents.
- **Focus on Safety, Reliablity and Efficiency**: Every component is built with a focus on ensuring safety, reliability and efficiency. From using prompts that help mitigate LLM hallucination and deter prompt injection attacks, to providing in-built support for enabling authentication for each endpoint, QvikChat is designed to help you build secure, performant and reliable chat apps and services.

## Installation

You can either install QvikChat as a package or use the QvikChat starter template to get started quickly. The QvikChat starter template comes pre-configured with QvikChat, TypeScript, ESLint, Jest and more.

### Install QvikChat as a package

To install QvikChat as a package, run the following command:

```bash copy
npm install qvikchat # or pnpm add qvikchat
```

Before you can deploy your chat endpoints, you need to setup Firebase Genkit, either by using the default configurations or by providing your own configurations, these may include additional Genkit plugins you may want to enable (e.g. to add support for a new language model). When starting out, we recommend using the default configurations.

Create a `index.ts` (or `index.js`) file and add the following code:

```typescript copy
import { runServer, setupGenkit } from "qvikchat/genkit";
import { defineChatEndpoint } from "qvikchat/endpoints";

// Setup Genkit
setupGenkit();

// Open-ended chat
defineChatEndpoint({
  endpoint: "chat",
});

// Run server
runServer();
```

That's it! Running the above code will run a Expressjs server with your defined chat endpoints accessible through it.

You should be able to access the chat endpoint defined above at the `chat` endpoint. To test from terminal, you can try the below command:

```bash copy
curl -X POST "http://127.0.0.1:3400/chat" -H "Content-Type: application/json"  -d '{"data": { "query": "Answer in one sentence: What is Firebase Firestore?" } }'
```

Above example points to `http://127.0.0.1:3400`. You can change this port and host depending on where you are running the server and on which port.

You could also use the [Genkit Developer UI](#genkit-developer-ui) to test the endpoints.

### QvikChat Starter Template

To get up and running quickly, you can use the QvikChat starter template. The starter template is a pre-configured project with all the necessary configurations and setup to get you started with QvikChat write quality and reliable code. It comes pre-configured with support for TypeScript, ESLint, Prettier, Jest, SWC, and GitHub Actions, so you can get started with developing the next revolutionary chat app right away.

Simply, clone the [QvikChat starter template](https://github.com/oconva/qvikchat-starter-template) to get started.

```bash copy
git clone https://github.com/oconva/qvikchat-starter-template.git
```

Once you have cloned the starter template, you can run the following commands to get started:

```bash copy
cd qvikchat-starter-template
npm install # or pnpm install
npm run start # or pnpm start
```

To build the project, run:

```bash copy
npm run build # or pnpm build
```

And to run the included tests, run:

```bash copy
npm run test # or pnpm test
```

To learn more about the QvikChat starter template, check the [QvikChat Starter Template](https://github.com/oconva/qvikchat-starter-template) repo.

### Genkit Developer UI

You can run the Genkit developer UI to test the endpoints. Testing the endpoints using a graphical interface is probably the easiest way to get started. You can know more about the Genkit Developer UI [here](https://firebase.google.com/docs/genkit/devtools#genkit_developer_ui).

Start the Genkit developer UI:

```bash copy
npx genkit start
```

OR, you can install the Genkit CLI globally:

```bash copy
npm i -g genkit
```

Then start the Genkit developer UI:

```bash copy
genkit start
```

## Documentation

You can view QvikChat's official documentation here: [QvikChat](https://qvikchat.pkural.ca).

You can also check [Examples](https://qvikchat.pkural.ca/examples) to see some examples of using QvikChat, for example, building a custom RAG chat service that can suggest products to customers.

## Upcoming Changes

QvikChat will always remain a minimalistic and extensible framework allowing developers to get started and build chat apps and services quickly and with ease. However, there is a lot that can be done to improve QvikChat and to help guide users to take the full advantage of QvikChat.

Below are some upcoming changes that are focusing on currently:

- **Support for Multimodal Input/Output**: In the coming version, we aim to provide support for multimodal input and output, for both RAG and non-RAG chat endpoints.
- **Better Endpoint Usage Metrics**: Our focus will be on adding support for enabling developers and users have access to more detailed endpoint usage statistics and metrics.
- **More examples**: Adding more examples of various use-cases where QvikChat could be used to increase the pace of development and reduce complexity. There will be more examples coming up specifically for RAG and multimodal chat services.
- **Completely Self-hosted Solution**: We plan on adding more integrations to QvikChat to enable development of completely self-hosted chat services. This includes the use of self-hosted LLM model (through [Ollama](https://ollama.com/)) and self-hosted vector store (through [ChromaDB](https://www.trychroma.com/) / [Milvus](https://milvus.io/)).

If you find value from this project, please consider contributing or sponsoring the project to help maintain and improve it. All contributions and support are greatly appreciated!

[Sponsor &#9829;](https://github.com/sponsors/oconva)

## Notes

QvikChat is a minimalistic extensible framework. Its meant to give you a **starting point** so you can quickly get started with building your chat app or service using Genkit, eliminating the need for you to deal with setting up the whole project from scratch.

This means that this framework is not exhaustive, and you may add more features, chat agent types, cloud-based database support, etc. as you see fit. Since, it is built on top of Genkit and LangChain, you can easily add more models, chat history stores, vector stores and more.

<blockquote>
  Note: This is not an official Firebase Genkit or LangChain framework. This is
  a community-driven project. Firebase Genkit is currently in beta, this means
  that the public API and framework design may change in backward-incompatible
  ways. We will do our best to keep this project up-to-date.
</blockquote>
  
## Contributions

Contributions are welcome! Please refer to the [contribution guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues

If you encounter any issues or bugs while using QvikChat, please report them by following these steps:

1. Check if the issue has already been reported by searching our issue tracker.
2. If the issue hasn't been reported, create a new issue and provide a detailed description of the problem.
3. Include steps to reproduce the issue and any relevant error messages or screenshots.

[Open Issue](https://github.com/pranav-kural/QvikChat/issues)
