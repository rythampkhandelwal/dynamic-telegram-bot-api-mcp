import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { type AppConfig } from "./config.js";
import type { Logger } from "./logger.js";
import { TelegramClient } from "./telegram-client.js";
type ProjectContextErrorCode = "PROJECT_ROOT_AMBIGUOUS" | "PROJECT_ROOT_UNAVAILABLE" | "PROJECT_ROOT_UNSUPPORTED";
type RootProvider = Pick<Server, "getClientCapabilities" | "listRoots">;
export interface ResolvedProjectContext {
    config: AppConfig;
    client?: TelegramClient;
    projectRoot?: string;
}
interface ProjectContextResolverOptions {
    rootProvider: RootProvider;
    fallbackConfig: AppConfig;
    environment: NodeJS.ProcessEnv;
    logger: Logger;
    createClient?: (config: AppConfig) => TelegramClient;
}
export declare class ProjectContextError extends Error {
    readonly code: ProjectContextErrorCode;
    constructor(code: ProjectContextErrorCode, message: string);
}
export declare class ProjectContextResolver {
    private readonly options;
    private readonly clients;
    private readonly createClient;
    constructor(options: ProjectContextResolverOptions);
    resolve(): Promise<ResolvedProjectContext>;
    private contextFor;
    private createAndCacheClient;
}
export {};
