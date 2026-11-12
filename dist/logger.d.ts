export type LogLevel = "debug" | "info" | "warn" | "error";
export declare class Logger {
    private readonly minimum;
    constructor(level?: LogLevel);
    log(level: LogLevel, event: string, fields?: Record<string, unknown>): void;
    debug(event: string, fields?: Record<string, unknown>): void;
    info(event: string, fields?: Record<string, unknown>): void;
    warn(event: string, fields?: Record<string, unknown>): void;
    error(event: string, fields?: Record<string, unknown>): void;
}
