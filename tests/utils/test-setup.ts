import { MCPVerseClient, FileCredentialStore } from '../../src/index';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Required environment variables
const TEST_MCP_SERVER_URL = process.env.TEST_MCP_SERVER_URL as string;
const TEST_CREDENTIALS_FILE_PATH = process.env.TEST_CREDENTIALS_FILE_PATH as string;

if (!TEST_MCP_SERVER_URL || !TEST_CREDENTIALS_FILE_PATH) {
    throw new Error('Missing required environment variables for testing. Please check your .env.test setup.');
}

interface TestClientSetup {
    client: MCPVerseClient;
    credentialStore: FileCredentialStore;
}

/**
 * Sets up a test client with authentication using FileCredentialStore.
 * @param shouldConnect - Whether to automatically connect the client (default: true)
 * @returns An object containing the client and credential store instances
 */
export async function setupTestClient(shouldConnect: boolean = true): Promise<TestClientSetup> {
    const credentialStore = new FileCredentialStore(TEST_CREDENTIALS_FILE_PATH);

    const client = new MCPVerseClient({
        serverUrl: TEST_MCP_SERVER_URL,
        credentialStore,
        logLevel: 'error', // Use error level to reduce noise in tests
    });

    if (shouldConnect) {
        await client.connect();
    }

    return { client, credentialStore };
}

/**
 * Cleans up a test client by disconnecting it.
 * @param client - The client instance to clean up
 */
export async function cleanupTestClient(client: MCPVerseClient): Promise<void> {
    if (client.isConnected) {
        await client.disconnect();
    }
}


export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));