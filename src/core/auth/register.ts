import { Logger } from "../logger/interface";
import { AgentRegisterDetails, AgentCredentials } from "../../types/auth";
import { MCPVerseAuthenticationError } from "../errors";

const LOG_PREFIX = "[Register]";

/**
 * Registers a new agent with the MCPVerse server.
 * @param serverUrl - The base URL of the MCPVerse server.
 * @param payload - Agent details for registration.
 * @param log - Logger instance.
 * @returns The credentials (agentId, privateKey) for the newly registered agent.
 */
export async function register(
  serverUrl: string,
  payload: AgentRegisterDetails,
  log: Logger,
): Promise<AgentCredentials> {
  try {
    const url = `${serverUrl}/api/auth/register`;
    const { apiKey, ...registrationBody } = payload;

    log.debug(
      `${LOG_PREFIX} Starting registration process for server: ${serverUrl}`,
    );
    log.debug(
      `${LOG_PREFIX} Registration payload: ${JSON.stringify(registrationBody)}`,
    );

    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["x-api-key"] = apiKey;
      log.debug(`${LOG_PREFIX} Using API key for registration`);
    }

    log.debug(`${LOG_PREFIX} Sending registration request to: ${url}`);
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(registrationBody),
    });

    if (!response.ok) {
      try {
        const errorBody = await response.json();
        log.error(
          `${LOG_PREFIX} Registration failed with status ${response.status}
          ${JSON.stringify(errorBody, null, 2)}`,
        );
        throw new MCPVerseAuthenticationError(
          `Registration failed: ${errorBody.error_description}`,
        );
      } catch (error) {
        const errorBody = await response.text();
        log.error(
          `${LOG_PREFIX} Registration failed with status ${response.status}: ${error || response.statusText}`,
        );
        throw new MCPVerseAuthenticationError(
          `Registration failed: ${errorBody || response.statusText}`,
        );
      }
    }

    log.debug(
      `${LOG_PREFIX} Registration request successful, parsing response`,
    );
    const responseData: AgentCredentials = await response.json();

    if (responseData?.agentId && responseData?.privateKey) {
      log.info(
        `${LOG_PREFIX} Successfully registered agent: ${responseData.agentId}`,
      );
      return responseData;
    } else {
      log.error(
        `${LOG_PREFIX} Registration response missing required fields: agentId or privateKey`,
      );
      throw new MCPVerseAuthenticationError(
        "Registration response missing expected fields",
      );
    }
  } catch (error: any) {
    log.error(`${LOG_PREFIX} Registration process failed:`, error);
    if (error instanceof MCPVerseAuthenticationError) {
      throw error;
    }
    throw new MCPVerseAuthenticationError(
      `Registration failed: ${error.message || "Unknown error"}`,
    );
  }
}
