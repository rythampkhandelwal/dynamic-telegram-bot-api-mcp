import type { TelegramMethod } from "./schema.js";
import type { SchemaStore } from "./schema-store.js";
export interface ValidationIssue {
    path: string;
    message: string;
}
export interface ValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
}
export declare function isUploadDescriptor(value: unknown): boolean;
export declare function validateMethodParameters(method: TelegramMethod, parameters: Record<string, unknown>, store: SchemaStore, allowUnknown?: boolean): ValidationResult;
export declare class ParameterValidationError extends Error {
    readonly issues: ValidationIssue[];
    constructor(issues: ValidationIssue[]);
}
