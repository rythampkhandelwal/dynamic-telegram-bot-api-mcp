import type { TelegramMethod } from "./schema.js";
export declare function searchMethods(methods: TelegramMethod[], query: string, limit?: number): Array<TelegramMethod & {
    score: number;
}>;
