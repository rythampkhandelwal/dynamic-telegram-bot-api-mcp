import { statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadProjectConfig } from "./config.js";
import { RateLimiter } from "./rate-limiter.js";
import { TelegramClient } from "./telegram-client.js";
export class ProjectContextError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = "ProjectContextError";
    }
}
function sameClientConfiguration(first, second) {
    return first.token === second.token
        && first.apiBaseUrl === second.apiBaseUrl
        && first.requestTimeoutMs === second.requestTimeoutMs
        && first.requestRetries === second.requestRetries
        && first.rateLimitPerSecond === second.rateLimitPerSecond
        && first.rateLimitBurst === second.rateLimitBurst;
}
export class ProjectContextResolver {
    options;
    clients = new Map();
    createClient;
    constructor(options) {
        this.options = options;
        this.createClient = options.createClient ?? ((config) => {
            if (!config.token)
                throw new Error("Cannot create a Telegram client without a bot token");
            return new TelegramClient({
                token: config.token,
                baseUrl: config.apiBaseUrl,
                timeoutMs: config.requestTimeoutMs,
                retries: config.requestRetries,
                limiter: new RateLimiter(config.rateLimitPerSecond, config.rateLimitBurst),
                logger: options.logger,
            });
        });
    }
    async resolve() {
        if (!this.options.rootProvider.getClientCapabilities()?.roots) {
            return this.contextFor(this.options.fallbackConfig);
        }
        let roots;
        try {
            ({ roots } = await this.options.rootProvider.listRoots());
        }
        catch {
            throw new ProjectContextError("PROJECT_ROOT_UNAVAILABLE", "The MCP client did not provide its current workspace root");
        }
        if (roots.length === 0)
            return this.contextFor(this.options.fallbackConfig);
        if (roots.length > 1) {
            throw new ProjectContextError("PROJECT_ROOT_AMBIGUOUS", "The MCP client exposed multiple workspace roots; use a single-root workspace for Telegram calls");
        }
        const root = roots[0];
        if (!root) {
            throw new ProjectContextError("PROJECT_ROOT_UNAVAILABLE", "The MCP client did not provide its current workspace root");
        }
        let projectRoot;
        try {
            const rootUrl = new URL(root.uri);
            if (rootUrl.protocol !== "file:")
                throw new Error("Unsupported root protocol");
            projectRoot = resolve(fileURLToPath(rootUrl));
            if (!statSync(projectRoot).isDirectory())
                throw new Error("Workspace root is not a directory");
        }
        catch {
            throw new ProjectContextError("PROJECT_ROOT_UNSUPPORTED", "The MCP workspace root must be a local file URI");
        }
        return this.contextFor(loadProjectConfig(this.options.environment, projectRoot), projectRoot);
    }
    contextFor(config, projectRoot) {
        const cacheKey = projectRoot ?? "\0fallback";
        if (!config.token) {
            this.clients.delete(cacheKey);
            return { config, ...(projectRoot ? { projectRoot } : {}) };
        }
        const cached = this.clients.get(cacheKey);
        const client = cached && sameClientConfiguration(cached.config, config)
            ? cached.client
            : this.createAndCacheClient(cacheKey, config);
        return { config, client, ...(projectRoot ? { projectRoot } : {}) };
    }
    createAndCacheClient(cacheKey, config) {
        const client = this.createClient(config);
        this.clients.set(cacheKey, { config, client });
        return client;
    }
}
//# sourceMappingURL=project-context.js.map