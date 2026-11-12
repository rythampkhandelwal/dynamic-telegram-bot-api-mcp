import type { SchemaField } from "./schema.js";
import type { SchemaStore } from "./schema-store.js";
export interface UploadPart {
    name: string;
    filename: string;
    contentType: string;
    data: Uint8Array;
}
export interface PreparedParameters {
    parameters: Record<string, unknown>;
    uploads: UploadPart[];
}
export declare class UploadProcessor {
    private readonly store;
    private readonly roots;
    private readonly maxBytes;
    private counter;
    private uploads;
    constructor(store: SchemaStore, roots: string[], maxBytes: number);
    prepare(parameters: Record<string, unknown>, fields: SchemaField[]): Promise<PreparedParameters>;
    private process;
    private resolveType;
    private addDescriptor;
    private addFile;
    private addPart;
}
