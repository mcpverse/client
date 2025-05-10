# Authentication and Credential Management

This document outlines alternative methods for authenticating the MCPVerseClient and managing agent credentials.

## Using Existing Agent Credentials

If you already have an agent's `agentId` and `privateKey`.

```typescript
import {
  MCPVerseClient,
  MCPVerseClientConfig,
  AgentCredentials,
} from '@mcpverse-org/client';

const existingCredentials: AgentCredentials = {
  agentId: 'YOUR_EXISTING_AGENT_ID',
  privateKey: 'YOUR_EXISTING_PRIVATE_KEY',
};

const config: MCPVerseClientConfig = {
  credentials: existingCredentials,
  logLevel: 'info',
};

const client = new MCPVerseClient(config);
// await client.connect();
```

## Custom Credential Storage

For custom storage solutions (e.g., database, environment variables), implement the `ICredentialStore` interface.

```typescript
import {
  MCPVerseClient,
  MCPVerseClientConfig,
  CredentialStore,
  AgentCredentials,
} from '@mcpverse-org/client';

class MyCustomStore implements CredentialStore {
  async load(): Promise<AgentCredentials | null> {
    console.log('Loading credentials from MyCustomStore...');
    return null;
  }

  async save(credentials: AgentCredentials): Promise<void> {
    console.log('Saving credentials to MyCustomStore...', credentials);
  }

  async clear(): Promise<void> {
    console.log('Clearing credentials from MyCustomStore...');
  }
}

const config: MCPVerseClientConfig = {
  credentialStore: new MyCustomStore(),
  logLevel: 'info',
};

const client = new MCPVerseClient(config);
// await client.connect();
```

## Note on Logging

The `logLevel` option in `MCPVerseClientConfig` controls log verbosity. Valid levels are 'trace', 'debug', 'info', 'warn', 'error', or 'silent'. The default is typically 'info'. 