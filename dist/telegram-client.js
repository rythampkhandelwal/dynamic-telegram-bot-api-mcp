export class TelegramApiError extends Error {
    errorCode;
    parameters;
    ok = false;
    constructor(errorCode, description, parameters) {
        super(description);
        this.errorCode = errorCode;
        this.parameters = parameters;
        this.name = "TelegramApiError";
    }
    toJSON() {
        const result = { ok: false, description: this.message };
        if (this.errorCode !== undefined)
            result.error_code = this.errorCode;
        if (this.parameters)
            result.parameters = this.parameters;
        return result;
    }
}
const wait = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
export class TelegramClient {
    options;
    fetchImplementation;
    constructor(options) {
        this.options = options;
        this.fetchImplementation = options.fetchImplementation ?? fetch;
    }
    async call(method, parameters, uploads = []) {
        await this.options.limiter.acquire();
        const started = Date.now();
        for (let attempt = 0; attempt <= this.options.retries; attempt += 1) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(new Error("Telegram request timed out")), this.options.timeoutMs);
            try {
                const response = await this.fetchImplementation(this.endpoint(method), {
                    method: "POST",
                    ...this.body(parameters, uploads),
                    signal: controller.signal,
                });
                const payload = await this.parseResponse(response);
                if (payload.ok) {
                    this.audit(method, Object.keys(parameters), true, started, attempt);
                    return payload;
                }
                if (attempt < this.options.retries && this.retryable(response.status, payload.error_code)) {
                    const retryAfter = Number(payload.parameters?.retry_after);
                    await wait(Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt);
                    continue;
                }
                this.audit(method, Object.keys(parameters), false, started, attempt, payload.error_code);
                throw new TelegramApiError(payload.error_code, this.redact(payload.description), payload.parameters);
            }
            catch (error) {
                if (error instanceof TelegramApiError)
                    throw error;
                if (attempt < this.options.retries) {
                    await wait(250 * 2 ** attempt);
                    continue;
                }
                this.audit(method, Object.keys(parameters), false, started, attempt);
                const description = controller.signal.aborted ? "Telegram request timed out" : "Telegram network request failed";
                throw new TelegramApiError(undefined, description);
            }
            finally {
                clearTimeout(timeout);
            }
        }
        throw new TelegramApiError(undefined, "Telegram request failed");
    }
    endpoint(method) {
        return `${this.options.baseUrl}/bot${this.options.token}/${encodeURIComponent(method)}`;
    }
    body(parameters, uploads) {
        if (!uploads.length)
            return { headers: { "content-type": "application/json" }, body: JSON.stringify(parameters) };
        const form = new FormData();
        for (const [key, value] of Object.entries(parameters)) {
            form.append(key, typeof value === "object" && value !== null ? JSON.stringify(value) : String(value));
        }
        for (const upload of uploads) {
            const data = Uint8Array.from(upload.data);
            form.append(upload.name, new Blob([data], { type: upload.contentType }), upload.filename);
        }
        return { body: form };
    }
    async parseResponse(response) {
        let value;
        try {
            value = await response.json();
        }
        catch {
            throw new TelegramApiError(response.status, `Telegram returned a non-JSON response (HTTP ${response.status})`);
        }
        if (!value || typeof value !== "object" || typeof value.ok !== "boolean") {
            throw new TelegramApiError(response.status, "Telegram returned a malformed response");
        }
        return value;
    }
    retryable(status, errorCode) { return status === 429 || status >= 500 || errorCode === 429; }
    redact(value) { return value.split(this.options.token).join("[REDACTED]"); }
    audit(method, parameterNames, ok, started, retries, errorCode) {
        this.options.logger.info("telegram_api_call", { method, parameterNames, ok, durationMs: Date.now() - started, retries, errorCode });
    }
}
//# sourceMappingURL=telegram-client.js.map