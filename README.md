# QvikChat

Framework to build secure, performant and reliable chat apps and services quickly and efficiently.

Develop a self-hosted production-ready AI-powered chat app or service at a rapid pace with this [Firebase Genkit](https://github.com/firebase/genkit) and [LangChain](https://js.langchain.com/v0.2/docs/introduction/) based framework.

**QvikChat** is a framework that provides you with a solid foundation to build powerful AI-powered chat service endpoints quickly and efficiently. It includes support for **multiple types of conversations (open-ended, close-ended)**, **chat history**, **response caching**, **authentication**, and **information retrieval using Retrieval Augmented Generation (RAG).**

[Get Started](https://qvikchat.pkural.ca/getting-started) | [Documentation](https://qvikchat.pkural.ca)

[![Pre-deploy Workflow - lint, test, build](https://github.com/oconva/qvikchat/actions/workflows/build.yml/badge.svg)](https://github.com/oconva/qvikchat/actions/workflows/build.yml) [![CodeQL](https://github.com/oconva/qvikchat/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/oconva/qvikchat/actions/workflows/codeql.yml) [![Dependency review](https://github.com/oconva/qvikchat/actions/workflows/dependency-review.yml/badge.svg)](https://github.com/oconva/qvikchat/actions/workflows/dependency-review.yml) [![Publish package to NPM](https://github.com/oconva/qvikchat/actions/workflows/publish-npm.yml/badge.svg?event=release)](https://github.com/oconva/qvikchat/actions/workflows/publish-npm.yml) [![npm version](https://badge.fury.io/js/@oconva%2Fqvikchat.svg)](https://badge.fury.io/js/@oconva%2Fqvikchat)

## QvikChat Chat Endpoint demo

![QvikChat RAG Demo](https://github.com/oconva/qvikchat/assets/17651852/11864142-b75b-4076-87fe-dbd301dbfa75)

## Features

- **Endpoints with Chat History, Authentication, Caching, and RAG**: Built-in architecture to help you build chat endpoints with support for **conversation history**, **authenticated endpoints**, **response caching** for faster response times, and **RAG** for answering queries that require additional context data.
- **RAG**: Built-in support for loading text, CSV, JSON, PDF, or code files easily, and generating and storing embeddings in a vector store to support information retrieval for context-aware chat endpoints. Add additional data loaders easily through LangChain, for example, to support ingesting data from cloud storage. For all available integrations for data loaders, check [Document loaders | 🦜️🔗 Langchain.](https://js.langchain.com/v0.1/docs/integrations/document_loaders/)
- **Deploy to any NodeJS platform**: Deploy your app or service to any NodeJS platform, including Firebase, Google Cloud, AWS, Heroku, etc., with ease.
- **Dotprompt**: Supports [Dotprompt](https://firebase.google.com/docs/genkit/dotprompt) for well-structured prompts with all relevant metadata and input-output data validation.
- **Firebase Firestore**: In-built support for using [Cloud Firestore](https://firebase.google.com/docs/firestore) as the chat history store, cache store, and API key store.
- **Firebase Genkit**: Built using the open-source [Firebase Genkit framework](https://firebase.google.com/docs/genkit) to help you build powerful production-ready AI-powered services with the possibility of easily extending the framework's functionalities through Genkit plugins.
- **LangChain**: Built using the open-source [LangChain framework](https://js.langchain.com/v0.2/docs/introduction/) to help you process data for RAG and information retrieval. Easily extend the framework by using any LangChain-supported embedding model, vector store, data loader, and more.
- **Focus on Performance, Reliability, and Security**: Every component in QvikChat is built to ensure low latency and scalable performance without compromising on security. From using prompts that help mitigate LLM hallucination and deter prompt injection attacks, to providing in-built support for enabling authentication for each endpoint, QvikChat is designed to help you build secure, performant, and reliable chat apps and services.

## QvikChat Starter Template

To get up and running quickly, you can use the QvikChat starter template. The starter template is a pre-configured project with all the necessary configurations and setup to get you started with QvikChat write quality and reliable code. It comes pre-configured with support for TypeScript, ESLint, Prettier, Jest, SWC, and GitHub Actions, so you can get started with developing the next revolutionary chat app right away.

To learn more about the QvikChat starter template, check the [QvikChat Starter Template](https://github.com/oconva/qvikchat-starter-template) repo.

## Documentation

You can view QvikChat's official documentation here: [QvikChat](https://qvikchat.pkural.ca).

You can also check [Examples](https://qvikchat.pkural.ca/examples) to see some examples of using QvikChat, for example, building a custom RAG chat service that can suggest products to customers.

## Upcoming Changes

Below are some of the upcoming changes that the QvikChat project will focus on:

- **Better Observability & Tracing**: Adding support for better observability and tracing to help you monitor and debug your chat services more effectively.
- **Usage Tracking**: Adding support for tracking usage of the chat service, including tracking the number of requests, response times, token usage, and more.
- **More examples**: Adding more examples of various use-cases where QvikChat could be used to increase the pace of development and reduce complexity. There will be more examples coming up specifically for RAG and multimodal chat services.
- **Completely Self-hosted Solution**: We plan on adding more integrations to QvikChat to enable development of completely self-hosted chat services. This includes the use of self-hosted LLM model (through [Ollama](https://ollama.com/)) and self-hosted vector store (through [ChromaDB](https://www.trychroma.com/) / [Milvus](https://milvus.io/)).

Check the [QvikChat Milestones](https://github.com/oconva/qvikchat/milestones) for upcoming changes specific to each feature release.

## Sponsor

If you find value from this project, please consider contributing or sponsoring the project to help maintain and improve it. All contributions and support are greatly appreciated!

[Sponsor &#9829;](https://github.com/sponsors/oconva)

## Notes

QvikChat uses the [Firebase Genkit](https://github.com/firebase/genkit) and [LangChain](https://js.langchain.com/v0.2/docs/introduction/) open-source frameworks under the hood for several functionalities. Its important to note that Firebase Genkit is currently in beta, and the public API and framework design may change in backward-incompatible ways. We will do our best to keep this project up-to-date with the latest changes in Firebase Genkit and LangChain.

## Contributions

Contributions are welcome! Please refer to the [contribution guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Issues

If you encounter any issues or bugs while using QvikChat, please report them by following these steps:

1. Check if the issue has already been reported by searching our issue tracker.
2. If the issue hasn't been reported, create a new issue and provide a detailed description of the problem.
3. Include steps to reproduce the issue and any relevant error messages or screenshots.

[Open Issue](https://github.com/oconva/qvikchat/issues)
