import { runFlowsServer, setupGenkit } from './genkit';
import { defineTestFlows } from '/test-flows';

// Setup Genkit
setupGenkit();

setupGenkit({
	firebaseConfig: {
		projectId: 'my-project-id',
	},
});

// Define flows
defineTestFlows();

// Run server
runFlowsServer();
