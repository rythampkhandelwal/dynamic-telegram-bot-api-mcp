const priorities = { debug: 10, info: 20, warn: 30, error: 40 };
export class Logger {
    minimum;
    constructor(level = "info") {
        this.minimum = priorities[level];
    }
    log(level, event, fields = {}) {
        if (priorities[level] < this.minimum)
            return;
        process.stderr.write(`${JSON.stringify({ timestamp: new Date().toISOString(), level, event, ...fields })}\n`);
    }
    debug(event, fields) { this.log("debug", event, fields); }
    info(event, fields) { this.log("info", event, fields); }
    warn(event, fields) { this.log("warn", event, fields); }
    error(event, fields) { this.log("error", event, fields); }
}
//# sourceMappingURL=logger.js.map