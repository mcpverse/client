import { AgentCredentials } from '../types/auth';

/**
 * Abstract class defining the interface for a credential storage mechanism.
 * Implementations of this class are responsible for persisting and retrieving agent credentials.
 */
export abstract class CredentialStore {
  /**
   * Loads agent credentials from the store.
   * @returns A promise that resolves to the stored AgentCredentials, or null if not found.
   */
  abstract load(): Promise<AgentCredentials | null>;

  /**
   * Saves agent credentials to the store.
   * @param credentials The agent credentials to save.
   * @returns A promise that resolves when the credentials have been saved.
   */
  abstract save(credentials: AgentCredentials): Promise<void>;

  /**
   * Clears any stored agent credentials from the store.
   * @returns A promise that resolves when the credentials have been cleared.
   */
  abstract clear(): Promise<void>;
}
