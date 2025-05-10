export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  /** Current minimum level that will be emitted */
  level: LogLevel;
  /** Logs a message at the trace level. */
  trace(msg: string, ...meta: unknown[]): void;
  /** Logs a message at the debug level. */
  debug(msg: string, ...meta: unknown[]): void;
  /** Logs a message at the info level. */
  info(msg: string, ...meta: unknown[]): void;
  /** Logs a message at the warn level. */
  warn(msg: string, ...meta: unknown[]): void;
  /** Logs a message at the error level. */
  error(msg: string, ...meta: unknown[]): void;
  /** Optional child‑context creator (noop in basic console impl) */
  child?(ctx: Record<string, unknown>): Logger;
}
