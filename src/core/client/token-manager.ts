import { AuthTokenResponse } from "../../types/auth";
import { Logger } from "../logger/interface";
import { TOKEN_EXPIRY_BUFFER_MS } from "../../constants";

const LOG_PREFIX = "[TokenManager]";

/**
 * Manages the lifecycle of an authentication token, including fetching,
 * caching, and proactive refreshing before expiry.
 */
export class TokenManager {
  private token?: AuthTokenResponse;
  private tokenIssuedAt?: number; // To store the timestamp when the token was fetched

  /**
   * Creates an instance of TokenManager.
   * @param fetchFn A function that, when called, fetches a new authentication token.
   * @param log A logger instance.
   */
  constructor(
    private fetchFn: () => Promise<AuthTokenResponse>,
    private log: Logger,
  ) {}

  private get expiresAt() {
    if (!this.token || !this.tokenIssuedAt) return 0;
    // Calculate actual expiry time and then apply the buffer
    const actualExpiryTime = this.tokenIssuedAt + this.token.expires_in * 1000;
    return actualExpiryTime - TOKEN_EXPIRY_BUFFER_MS;
  }

  /**
   * Retrieves the current valid access token.
   * If the token is missing, expired, or nearing expiry, it will be refreshed.
   * @returns A promise that resolves to the access token string.
   */
  async get(): Promise<string> {
    if (!this.token) {
      this.log.debug(`${LOG_PREFIX} No token available, refreshing...`);
      await this.refresh();
    } else if (Date.now() >= this.expiresAt) {
      this.log.debug(
        `${LOG_PREFIX} Token expired or expiring soon (expires at ${new Date(this.expiresAt).toISOString()}), refreshing...`,
      );
      await this.refresh();
    } else {
      this.log.debug(
        `${LOG_PREFIX} Using existing token, expires at ${new Date(this.expiresAt).toISOString()}`,
      );
    }
    return this.token!.access_token;
  }

  /**
   * Forces a refresh of the authentication token.
   * @throws An error if the token refresh fails.
   */
  async refresh() {
    this.log.info(`${LOG_PREFIX} Attempting to refresh token...`);
    try {
      const newToken = await this.fetchFn();
      if (!newToken) {
        this.log.error(
          `${LOG_PREFIX} Token refresh failed: No token received from fetch function`,
        );
        throw new Error("Unable to refresh token");
      }
      this.token = newToken;
      this.tokenIssuedAt = Date.now(); // Store the issuance time
      this.log.info(
        `${LOG_PREFIX} Token refreshed successfully, expires in ${newToken.expires_in} seconds`,
      );
    } catch (error) {
      this.log.error(`${LOG_PREFIX} Token refresh failed:`, error);
      throw error;
    }
  }
}
