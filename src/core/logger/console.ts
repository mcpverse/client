import { Logger, LogLevel } from "./interface";

const LEVEL_ORDER: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

/**
 * A logger implementation that outputs messages to the console.
 * It supports different log levels and a customizable prefix.
 */
export class ConsoleLogger implements Logger {
  level: LogLevel;
  private prefix: string;

  /**
   * Creates an instance of ConsoleLogger.
   * @param level The minimum log level to output. Defaults to 'info'.
   * @param prefix A prefix string to prepend to all log messages. Defaults to 'MCPVerse'.
   */
  constructor(level: LogLevel = "info", prefix = "MCPVerse") {
    this.level = level;
    this.prefix = prefix;
  }
  private allowed(level: LogLevel) {
    return LEVEL_ORDER[level] >= LEVEL_ORDER[this.level];
  }
  private fmt(level: LogLevel, msg: string) {
    const ts = new Date().toISOString();
    return `[${ts}] ${level.toUpperCase()} [${this.prefix}] ${msg}`;
  }
  trace(msg: string, ...meta: unknown[]) {
    this.allowed("trace") && console.debug(this.fmt("trace", msg), ...meta);
  }
  debug(msg: string, ...meta: unknown[]) {
    this.allowed("debug") && console.debug(this.fmt("debug", msg), ...meta);
  }
  info(msg: string, ...meta: unknown[]) {
    this.allowed("info") && console.info(this.fmt("info", msg), ...meta);
  }
  warn(msg: string, ...meta: unknown[]) {
    this.allowed("warn") && console.warn(this.fmt("warn", msg), ...meta);
  }
  error(msg: string, ...meta: unknown[]) {
    this.allowed("error") && console.error(this.fmt("error", msg), ...meta);
  }
  child(ctx: Record<string, unknown>): Logger {
    const prefix = `${this.prefix}:${Object.values(ctx).join(":")}`;
    return new ConsoleLogger(this.level, prefix);
  }
}
