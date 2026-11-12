import type { Logger } from "./logger.js";
import { RateLimiter } from "./rate-limiter.js";
import type { UploadPart } from "./uploads.js";
export interface TelegramSuccess<T = unknown> {
    ok: true;
    result: T;
}
export interface TelegramFailure {
    ok: false;
    error_code?: number;
    description: string;
    parameters?: Record<string, unknown>;
}
export type TelegramResponse<T = unknown> = TelegramSuccess<T> | TelegramFailure;
export declare class TelegramApiError extends Error {
    readonly errorCode: number | undefined;
    readonly parameters?: Record<string, unknown> | undefined;
    readonly ok = false;
    constructor(errorCode: number | undefined, description: string, parameters?: Record<string, unknown> | undefined);
    toJSON(): TelegramFailure;
}
export interface TelegramClientOptions {
    token: string;
    baseUrl: string;
    timeoutMs: number;
    retries: number;
    limiter: RateLimiter;
    logger: Logger;
    fetchImplementation?: typeof fetch;
}
export declare class TelegramClient {
    private readonly options;
    private readonly fetchImplementation;
    constructor(options: TelegramClientOptions);
    call<T = unknown>(method: string, parameters: Record<string, unknown>, uploads?: UploadPart[]): Promise<TelegramSuccess<T>>;
    private endpoint;
    private body;
    private parseResponse;
    private retryable;
    private redact;
    private audit;
}
