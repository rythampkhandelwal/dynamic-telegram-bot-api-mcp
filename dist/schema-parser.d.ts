import { type TelegramSchema } from "./schema.js";
/** Parse the official Bot API HTML into a stable, transport-independent catalog. */
export declare function parseTelegramSchema(html: string, retrievedAt?: string, minimumEntries?: {
    methods: number;
    types: number;
}): TelegramSchema;
export declare function fetchTelegramSchema(fetchImplementation?: typeof fetch, signal?: AbortSignal): Promise<TelegramSchema>;
