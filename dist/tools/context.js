export function toolResult(value, isError = false) {
    return {
        content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
        structuredContent: value,
        ...(isError ? { isError: true } : {}),
    };
}
export function errorResult(error, description, parameters = {}) {
    return toolResult({ ok: false, error, description, parameters }, true);
}
//# sourceMappingURL=context.js.map