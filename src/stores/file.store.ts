import { promises as fs } from "node:fs";
import { dirname } from "node:path";
import { AgentCredentials } from "../types/auth"; // Import for the credential data type
import { Logger } from "../core/logger/interface";
import { CredentialStore } from "./store";
import { ConsoleLogger } from "../core/logger/console";
import { DEFAULT_LOG_LEVEL } from "../constants";

const LOG_PREFIX = "[FileCredentialStore]";

/**
 * Implements ICredentialStore using the local filesystem.
 * Stores credentials as a JSON file at the specified path.
 */
export class FileCredentialStore extends CredentialStore {
  private readonly filePath: string;
  private readonly log: Logger;

  /**
   * Creates an instance of FileCredentialsStore.
   * @param filePath The absolute or relative path to the file where credentials should be stored.
   */
  constructor(filePath: string, log?: Logger) {
    super();

    if (!filePath) {
      throw new Error("File path cannot be empty.");
    }

    this.filePath = filePath;
    this.log = log ?? new ConsoleLogger(DEFAULT_LOG_LEVEL);
    this.log.debug(`${LOG_PREFIX} Initialized with file path: ${filePath}`);
  }

  /**
   * Loads credentials from the specified file path.
   * Returns null if the file does not exist or contains invalid JSON.
   */
  async load(): Promise<AgentCredentials | null> {
    try {
      this.log.debug(
        `${LOG_PREFIX} Attempting to load credentials from: ${this.filePath}`,
      );
      const data = await fs.readFile(this.filePath, "utf-8");
      const credentials = JSON.parse(data) as AgentCredentials;

      if (credentials && credentials.agentId && credentials.privateKey) {
        this.log.info(
          `${LOG_PREFIX} Successfully loaded credentials for agent: ${credentials.agentId}`,
        );
        return credentials;
      }

      this.log.warn(
        `${LOG_PREFIX} Loaded file exists but contains invalid credentials`,
      );
      return null;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        this.log.debug(
          `${LOG_PREFIX} No credentials file found at: ${this.filePath}`,
        );
        return null;
      }
      this.log.error(`${LOG_PREFIX} Failed to load credentials:`, error);
      return null;
    }
  }

  /**
   * Saves credentials to the specified file path.
   * Overwrites the file if it already exists. Ensures the directory exists.
   */
  async save(credentials: AgentCredentials): Promise<void> {
    if (!credentials || !credentials.agentId || !credentials.privateKey) {
      this.log.error(`${LOG_PREFIX} Invalid credentials provided to save`);
      throw new Error("Invalid credentials provided to save.");
    }

    try {
      this.log.debug(
        `${LOG_PREFIX} Saving credentials for agent: ${credentials.agentId}`,
      );
      const dir = dirname(this.filePath);
      await fs.mkdir(dir, { recursive: true });

      const data = JSON.stringify(credentials, null, 2); // Pretty print JSON
      await fs.writeFile(this.filePath, data, "utf-8");
      this.log.info(
        `${LOG_PREFIX} Successfully saved credentials for agent: ${credentials.agentId}`,
      );
    } catch (error: any) {
      this.log.error(`${LOG_PREFIX} Failed to save credentials:`, error);
      throw new Error(`Failed to save credentials: ${error.message}`);
    }
  }

  /**
   * Deletes the credentials file.
   */
  async clear(): Promise<void> {
    try {
      this.log.debug(
        `${LOG_PREFIX} Attempting to clear credentials file: ${this.filePath}`,
      );
      await fs.unlink(this.filePath);
      this.log.info(`${LOG_PREFIX} Successfully cleared credentials file`);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        this.log.debug(`${LOG_PREFIX} No credentials file found to clear`);
        return;
      }
      this.log.error(`${LOG_PREFIX} Failed to clear credentials:`, error);
      throw new Error(`Failed to clear credentials: ${error.message}`);
    }
  }
}
