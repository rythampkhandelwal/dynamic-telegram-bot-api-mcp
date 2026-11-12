import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { fetchTelegramSchema } from "./schema-parser.js";
const fieldSchema = z.object({
    name: z.string(), type: z.string(), required: z.boolean(), description: z.string(), enum: z.array(z.string()).optional(),
});
const catalogSchema = z.object({
    source: z.string().url(), retrievedAt: z.string().datetime(), version: z.string(),
    methods: z.array(z.object({
        name: z.string(), category: z.string(), description: z.string(), parameters: z.array(fieldSchema), returnType: z.string(), examples: z.array(z.string()).optional(),
    })),
    types: z.array(z.object({
        name: z.string(), category: z.string(), description: z.string(), fields: z.array(fieldSchema), variants: z.array(z.string()).optional(), examples: z.array(z.string()).optional(),
    })),
    enums: z.array(z.object({ name: z.string(), values: z.array(z.string()), description: z.string() })),
});
export const defaultSchemaPath = resolve(fileURLToPath(new URL("../data/telegram-bot-api.json", import.meta.url)));
export class SchemaStore {
    filePath;
    fetcher;
    schema;
    methods = new Map();
    types = new Map();
    refreshInFlight;
    constructor(filePath = defaultSchemaPath, fetcher = fetchTelegramSchema) {
        this.filePath = filePath;
        this.fetcher = fetcher;
    }
    async load() {
        const raw = await readFile(this.filePath, "utf8");
        const parsed = catalogSchema.parse(JSON.parse(raw));
        this.install(parsed);
        return parsed;
    }
    async initialize(maxAgeMs) {
        let local;
        try {
            local = await this.load();
        }
        catch { /* refresh below */ }
        const stale = !local || Date.now() - Date.parse(local.retrievedAt) > maxAgeMs;
        if (!stale)
            return { schema: local, refreshed: false };
        try {
            return { schema: await this.refresh(), refreshed: true };
        }
        catch (error) {
            if (!local)
                throw error;
            return { schema: local, refreshed: false, refreshError: error instanceof Error ? error.message : String(error) };
        }
    }
    async refresh() {
        if (this.refreshInFlight)
            return this.refreshInFlight;
        this.refreshInFlight = this.fetcher().then(async (schema) => {
            await mkdir(dirname(this.filePath), { recursive: true });
            const temporary = `${this.filePath}.${process.pid}.tmp`;
            await writeFile(temporary, `${JSON.stringify(schema, null, 2)}\n`, { encoding: "utf8", mode: 0o644 });
            await rename(temporary, this.filePath);
            this.install(schema);
            return schema;
        }).finally(() => { this.refreshInFlight = undefined; });
        return this.refreshInFlight;
    }
    getSchema() {
        if (!this.schema)
            throw new Error("Telegram schema is not initialized");
        return this.schema;
    }
    getMethod(name) { return this.methods.get(name.toLowerCase()); }
    getType(name) { return this.types.get(name.toLowerCase()); }
    install(schema) {
        this.schema = schema;
        this.methods = new Map(schema.methods.map((method) => [method.name.toLowerCase(), method]));
        this.types = new Map(schema.types.map((type) => [type.name.toLowerCase(), type]));
    }
}
//# sourceMappingURL=schema-store.js.map