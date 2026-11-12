import type { LogLevel } from "./logger.js";
export interface AppConfig {
    token?: string;
    apiBaseUrl: string;
    methodAllowlist: string[];
    requestTimeoutMs: number;
    requestRetries: number;
    rateLimitPerSecond: number;
    rateLimitBurst: number;
    schemaMaxAgeMs: number;
    schemaPath?: string;
    localFileRoots: string[];
    maxUploadBytes: number;
    allowUnknownParameters: boolean;
    logLevel: LogLevel;
}
export declare function loadConfig(environment?: NodeJS.ProcessEnv, workingDirectory?: string): AppConfig;
export declare function loadProjectConfig(environment: NodeJS.ProcessEnv, projectDirectory: string): AppConfig;
