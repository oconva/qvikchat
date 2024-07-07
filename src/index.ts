// import { ChatAgent } from "./agents/chat-agent";
// import { defineChatEndpoint } from "./endpoints/endpoints";
// import { runServer, setupGenkit } from "./genkit/genkit";


// setupGenkit();

// defineChatEndpoint({
//   chatAgent: new ChatAgent({
//     agentType: "close-ended",
//     topic: "Store Inventory Data",
//     model: "gemini15Flash",
//     modelConfig: {
//       version: "latest",
//       temperature: 0.5,
//       maxOutputTokens: 2048,
//       safetySettings: [
//         {
//           category: "HARM_CATEGORY_DANGEROUS_CONTENT",
//           threshold: "BLOCK_LOW_AND_ABOVE",
//         },
//       ],
//     },
//   }),
//   endpoint: "chat",
//   topic: "Store Inventory Data",
// });

// runServer();

export {};