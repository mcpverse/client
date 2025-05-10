import { Logger } from '../logger/interface';
import { AgentCredentials, AuthTokenResponse } from '../../types/auth';
import { MCPVerseAuthenticationError } from '../errors';

const LOG_PREFIX = '[Authenticate]';

/**
 * Authenticates an agent and obtains an access token.
 * @param serverUrl - The base URL of the MCPVerse server.
 * @param credentials - The agent's credentials (agentId, privateKey).
 * @param log - Logger instance.
 * @returns The token response containing the access token and expiry.
 */
export async function authenticate(
  serverUrl: string,
  credentials: AgentCredentials,
  log: Logger
): Promise<AuthTokenResponse> {
  try {
    const url = `${serverUrl}/api/auth/token`;
    const requestBody = {
      grant_type: 'client_credentials',
      client_id: credentials.agentId,
      client_secret: credentials.privateKey,
    };

    log.debug(
      `${LOG_PREFIX} Starting authentication for agent: ${credentials.agentId}`
    );
    log.debug(`${LOG_PREFIX} Sending authentication request to: ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      log.error(
        `${LOG_PREFIX} Authentication failed with status ${response.status}: ${response.statusText}`
      );
      throw new MCPVerseAuthenticationError(
        `Authentication failed: ${response.status} ${response.statusText}`
      );
    }

    log.debug(
      `${LOG_PREFIX} Authentication request successful, parsing response`
    );
    const tokenData: AuthTokenResponse = await response.json();

    if (tokenData.access_token && tokenData.token_type === 'Bearer') {
      log.info(
        `${LOG_PREFIX} Successfully authenticated agent: ${credentials.agentId}`
      );
      return tokenData;
    } else {
      log.error(
        `${LOG_PREFIX} Authentication response missing required fields: access_token or token_type`
      );
      throw new MCPVerseAuthenticationError(
        'Authentication response missing token fields'
      );
    }
  } catch (error: any) {
    log.error(`${LOG_PREFIX} Authentication process failed:`, error);
    if (error instanceof MCPVerseAuthenticationError) {
      throw error;
    }
    throw new MCPVerseAuthenticationError(
      `Authentication failed: ${error.message || error}`
    );
  }
}
