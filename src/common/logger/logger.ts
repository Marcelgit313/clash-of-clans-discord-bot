import { ConsoleLogger } from "@nestjs/common";
import config from "config";
import type { Logger as WinstonLogger } from "winston";
import winston from "winston";

const LOGGING_FORMAT = config.get<string>("logging.format");
const LOGGING_LEVEL = config.get<string>("logging.level");

export class Logger extends ConsoleLogger {
  private readonly logger: WinstonLogger;

  private readonly errorLog: winston.LeveledLogMethod;
  private readonly warnLog: winston.LeveledLogMethod;
  private readonly infoLog: winston.LeveledLogMethod;
  private readonly verboseLog: winston.LeveledLogMethod;
  private readonly debugLog: winston.LeveledLogMethod;

  constructor(context: string) {
    super();
    const consoleFormat =
      LOGGING_FORMAT === "json" ? this.getJsonFormat(context) : this.getDefaultFormat(context);

    this.logger = winston.createLogger({
      format: consoleFormat,
      transports: [
        new winston.transports.Console({
          level: LOGGING_LEVEL,
        }),
      ],
      exitOnError: false,
      silent: false,
    });

    this.errorLog = this.logger.error.bind(this.logger);
    this.warnLog = this.logger.warn.bind(this.logger);
    this.infoLog = this.logger.info.bind(this.logger);
    this.verboseLog = this.logger.verbose.bind(this.logger);
    this.debugLog = this.logger.debug.bind(this.logger);
  }

  public setContext(context: string): void {
    this.context = context;
  }

  private getJsonFormat(context: string): winston.Logform.Format {
    return winston.format.combine(
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.printf(({ level, message, timestamp }) => {
        return JSON.stringify({
          winston_timestamp: timestamp,
          winston_message: `[${context}] ${message}`,
          winston_level: level,
        });
      })
    );
  }

  private getDefaultFormat(context: string): winston.Logform.Format {
    return winston.format.combine(
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp }) => {
        const padding = " ".repeat(Math.max(1, 18 - level.length));
        return `[${timestamp}] ${level}:${padding}[${context}] ${message}`;
      })
    );
  }

  log(message: string, ...optionalParams: unknown[]): void {
    this.infoLog(message, ...optionalParams);
  }

  error(message: string, ...optionalParams: unknown[]): void {
    this.errorLog(message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: unknown[]): void {
    this.warnLog(message, ...optionalParams);
  }

  debug(message: string, ...optionalParams: unknown[]): void {
    this.debugLog(message, ...optionalParams);
  }

  verbose(message: string, ...optionalParams: unknown[]): void {
    this.verboseLog(message, ...optionalParams);
  }
}