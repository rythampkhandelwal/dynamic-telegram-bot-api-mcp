import type { AppConfig } from "../config.js";
import type { Logger } from "../logger.js";
import type { ResolvedProjectContext } from "../project-context.js";
import type { SchemaStore } from "../schema-store.js";
import type { TelegramClient } from "../telegram-client.js";
export interface ToolContext {
    config: AppConfig;
    logger: Logger;
    store: SchemaStore;
    client?: TelegramClient;
    resolveProjectContext?: () => Promise<ResolvedProjectContext>;
}
export declare function toolResult(value: Record<string, unknown>, isError?: boolean): {
    content: {
        type: "text";
        text: string;
    }[];
    structuredContent: Record<string, unknown>;
    isError?: boolean;
};
export declare function errorResult(error: string, description: string, parameters?: Record<string, unknown>): {
    content: {
        type: "text";
        text: string;
    }[];
    structuredContent: Record<string, unknown>;
    isError?: boolean;
};
