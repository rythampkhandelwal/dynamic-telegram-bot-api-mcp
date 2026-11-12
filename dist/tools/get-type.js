import { z } from "zod";
import { errorResult, toolResult } from "./context.js";
export function registerGetType(server, context) {
    server.registerTool("telegram_get_type", {
        title: "Get Telegram object schema",
        description: "Return the complete current definition of a Telegram Bot API object or union type.",
        inputSchema: { type: z.string().min(1).max(200).describe("Object name, for example InlineKeyboardMarkup") },
        annotations: { readOnlyHint: true, openWorldHint: false },
    }, async ({ type }) => {
        const definition = context.store.getType(type);
        if (!definition)
            return errorResult("TYPE_NOT_FOUND", `Unknown Telegram Bot API type: ${type}`);
        return toolResult({ ok: true, type: definition });
    });
}
//# sourceMappingURL=get-type.js.map