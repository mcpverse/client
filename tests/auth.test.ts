/// <reference types="jest" />
import { MCPVerseClient, FileCredentialStore, MCPVerseClientConfig } from '../src/index';
import { MCPVerseAuthenticationError } from '../src/core/errors';
import dotenv from 'dotenv';
import fs from 'fs/promises'; // For file system operations

dotenv.config({ path: '.env.test' });

// ---- NO MOCKS ----
// All previous mock setups are removed. Tests will hit a real server.

// Increase timeout for network-dependent tests
jest.setTimeout(30000); // 30 seconds

const TEST_MCP_SERVER_URL = process.env.TEST_MCP_SERVER_URL;
const AUTH_TEST_CREDENTIALS_FILE_PATH_BASE = process.env.AUTH_TEST_CREDENTIALS_FILE_PATH || './test-credentials'; // Base path
const AUTH_TEST_AGENT_DISPLAY_NAME = process.env.AUTH_TEST_AGENT_DISPLAY_NAME;
const AUTH_TEST_AGENT_BIO = process.env.AUTH_TEST_AGENT_BIO;
const AUTH_TEST_API_KEY = process.env.AUTH_TEST_API_KEY;

if (!TEST_MCP_SERVER_URL || !AUTH_TEST_CREDENTIALS_FILE_PATH_BASE || !AUTH_TEST_AGENT_DISPLAY_NAME || !AUTH_TEST_AGENT_BIO || !AUTH_TEST_API_KEY) {
    throw new Error('Missing required environment variables for testing (TEST_MCP_SERVER_URL, AUTH_TEST_CREDENTIALS_FILE_PATH, AUTH_TEST_AGENT_DISPLAY_NAME, AUTH_TEST_AGENT_BIO, AUTH_TEST_API_KEY). Please check your .env.test setup.');
}

// Helper to clear credential files
const clearCredentialFile = async (filePath: string) => {
    try {
        await fs.unlink(filePath);
    } catch (error: any) {
        if (error.code !== 'ENOENT') { // Ignore if file doesn't exist
            console.warn(`Could not clear credential file ${filePath}:`, error);
        }
    }
};


describe('MCPVerseClient Registration and Authentication (Real Server)', () => {
    const registrationCredentialsFilePath = `${AUTH_TEST_CREDENTIALS_FILE_PATH_BASE}-reg-auth.json`;
    let registeredAgentId: string | null = null;

    beforeAll(async () => {
        // Ensure no old credential file interferes
        await clearCredentialFile(registrationCredentialsFilePath);
    });

    afterAll(async () => {
        // Clean up the credential file created during tests
        await clearCredentialFile(registrationCredentialsFilePath);
    });

    test('should register a new agent, connect, and save credentials', async () => {
        const registrationStore = new FileCredentialStore(registrationCredentialsFilePath);
        const registrationClient = new MCPVerseClient({
            serverUrl: TEST_MCP_SERVER_URL,
            agentDetailsForRegistration: {
                displayName: AUTH_TEST_AGENT_DISPLAY_NAME!,
                apiKey: AUTH_TEST_API_KEY!,
                bio: AUTH_TEST_AGENT_BIO,
            },
            credentialStore: registrationStore,
            logLevel: 'error', // Use 'debug' or 'info' for detailed logs if needed
        });

        await expect(registrationClient.connect()).resolves.not.toThrow();
        expect(registrationClient.isConnected).toBe(true);

        // Verify credentials were saved by trying to load them
        const savedCreds = await registrationStore.load();
        expect(savedCreds).not.toBeNull();
        expect(savedCreds?.agentId).toBeDefined();
        expect(savedCreds?.privateKey).toBeDefined();
        registeredAgentId = savedCreds!.agentId; // Save for next test

        await expect(registrationClient.disconnect()).resolves.not.toThrow();
        expect(registrationClient.isConnected).toBe(false);
    });

    test('should connect and disconnect successfully using existing (just registered) credentials', async () => {
        if (!registeredAgentId) {
            throw new Error("Registration test must run first and set registeredAgentId");
        }
        // This test relies on the previous test to have created and saved credentials.
        const authStore = new FileCredentialStore(registrationCredentialsFilePath);
        const authClient = new MCPVerseClient({
            serverUrl: TEST_MCP_SERVER_URL,
            credentialStore: authStore,
            logLevel: 'error',
        });

        await expect(authClient.connect()).resolves.not.toThrow();
        expect(authClient.isConnected).toBe(true);
        
        // Verify the client used the correct agentId from the store
        const loadedAuthCreds = await authStore.load();
        expect(loadedAuthCreds?.agentId).toBe(registeredAgentId); 

        await expect(authClient.disconnect()).resolves.not.toThrow();
        expect(authClient.isConnected).toBe(false);
    });


    test('should fail registration with 401 when API key is invalid', async () => {
        const invalidApiKeyFilePath = `${AUTH_TEST_CREDENTIALS_FILE_PATH_BASE}-invalid-key.json`;
        await clearCredentialFile(invalidApiKeyFilePath); // Ensure clean state
        const store = new FileCredentialStore(invalidApiKeyFilePath);

        const clientWithInvalidApiKey = new MCPVerseClient({
            serverUrl: TEST_MCP_SERVER_URL,
            agentDetailsForRegistration: {
                displayName: "TestInvalidKeyAgent",
                apiKey: 'invalid-api-key', // Clearly invalid API key
                bio: AUTH_TEST_AGENT_BIO,
            },
            credentialStore: store,
            logLevel: 'error',
        });

        await expect(clientWithInvalidApiKey.connect()).rejects.toThrow(MCPVerseAuthenticationError);
        expect(clientWithInvalidApiKey.isConnected).toBe(false);
        const creds = await store.load(); // Ensure no credentials were saved
        expect(creds).toBeNull();
        await clearCredentialFile(invalidApiKeyFilePath);
    });

    test('should fail registration with 401 when API key is missing', async () => {
        const missingApiKeyFilePath = `${AUTH_TEST_CREDENTIALS_FILE_PATH_BASE}-missing-key.json`;
        await clearCredentialFile(missingApiKeyFilePath); // Ensure clean state
        const store = new FileCredentialStore(missingApiKeyFilePath);

        const clientConfig: MCPVerseClientConfig = {
            serverUrl: TEST_MCP_SERVER_URL,
            agentDetailsForRegistration: {
                displayName: "TestMissingKeyAgent",
                apiKey: '', // Server should reject this
                bio: AUTH_TEST_AGENT_BIO,
            },
            credentialStore: store,
            logLevel: 'error',
        };
        // Remove apiKey if it's an empty string, as some fetch implementations might exclude it
        // or the server might specifically check for presence vs. empty.
        // The HTTP client layer should ideally handle not sending the x-api-key header if apiKey is empty.
        // For this test, we assume the server rejects an empty apiKey value sent in the header or if the header is missing.

        const clientWithMissingApiKey = new MCPVerseClient(clientConfig);

        await expect(clientWithMissingApiKey.connect()).rejects.toThrow(MCPVerseAuthenticationError);
        expect(clientWithMissingApiKey.isConnected).toBe(false);
        const creds = await store.load(); // Ensure no credentials were saved
        expect(creds).toBeNull();
        await clearCredentialFile(missingApiKeyFilePath);
    });

    test('should allow clearing credentials using FileCredentialStore', async () => {
        const clearTestFilePath = `${AUTH_TEST_CREDENTIALS_FILE_PATH_BASE}-clear-test.json`;
        await clearCredentialFile(clearTestFilePath); // Start clean

        const store = new FileCredentialStore(clearTestFilePath);
        // Save some dummy credentials
        const dummyAgentId = "agent-to-clear";
        await store.save({ agentId: dummyAgentId, privateKey: "dummy-key" });

        let loadedCreds = await store.load();
        expect(loadedCreds).not.toBeNull();
        expect(loadedCreds?.agentId).toBe(dummyAgentId);

        // Clear them
        await store.clear();

        // Try to load again
        loadedCreds = await store.load();
        expect(loadedCreds).toBeNull();

        // Ensure file is actually gone or empty (depending on clear implementation)
        try {
            const stats = await fs.stat(clearTestFilePath);
            // If file exists, it should be empty or FileCredentialStore.load() handles it
            // For this test, we mostly care that load() returns null.
            // If clear() deletes the file, fs.stat will throw ENOENT.
            expect(stats.isFile()).toBe(true); // Or handle ENOENT if clear deletes
        } catch (error: any) {
            expect(error.code).toBe('ENOENT'); // Expect file not to exist if clear deletes it
        }
        await clearCredentialFile(clearTestFilePath); // Final cleanup
    });
});
