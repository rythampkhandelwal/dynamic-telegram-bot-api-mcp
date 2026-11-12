import { z } from "zod";
import { errorResult, toolResult } from "./context.js";
export function registerGetMethod(server, context) {
    server.registerTool("telegram_get_method", {
        title: "Get Telegram method schema",
        description: "Return the complete current schema for one Telegram Bot API method.",
        inputSchema: { method: z.string().min(1).max(200).describe("Method name, for example sendPhoto") },
        annotations: { readOnlyHint: true, openWorldHint: false },
    }, async ({ method }) => {
        const definition = context.store.getMethod(method);
        if (!definition)
            return errorResult("METHOD_NOT_FOUND", `Unknown Telegram Bot API method: ${method}`);
        return toolResult({ ok: true, method: definition });
    });
}
//# sourceMappingURL=get-method.js.map