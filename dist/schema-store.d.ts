import { fetchTelegramSchema } from "./schema-parser.js";
import type { TelegramMethod, TelegramSchema, TelegramType } from "./schema.js";
export declare const defaultSchemaPath: string;
export declare class SchemaStore {
    readonly filePath: string;
    private readonly fetcher;
    private schema?;
    private methods;
    private types;
    private refreshInFlight;
    constructor(filePath?: string, fetcher?: typeof fetchTelegramSchema);
    load(): Promise<TelegramSchema>;
    initialize(maxAgeMs: number): Promise<{
        schema: TelegramSchema;
        refreshed: boolean;
        refreshError?: string;
    }>;
    refresh(): Promise<TelegramSchema>;
    getSchema(): TelegramSchema;
    getMethod(name: string): TelegramMethod | undefined;
    getType(name: string): TelegramType | undefined;
    private install;
}
