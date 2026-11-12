export class RateLimiter {
    ratePerSecond;
    burst;
    tokens;
    lastRefill = Date.now();
    constructor(ratePerSecond, burst) {
        this.ratePerSecond = ratePerSecond;
        this.burst = burst;
        this.tokens = burst;
    }
    async acquire(signal) {
        while (true) {
            this.refill();
            if (this.tokens >= 1) {
                this.tokens -= 1;
                return;
            }
            const delay = Math.max(1, Math.ceil(1000 / this.ratePerSecond));
            await new Promise((resolvePromise, reject) => {
                const timer = setTimeout(resolvePromise, delay);
                signal?.addEventListener("abort", () => {
                    clearTimeout(timer);
                    reject(signal.reason ?? new Error("Request aborted"));
                }, { once: true });
            });
        }
    }
    refill() {
        const now = Date.now();
        const elapsedSeconds = (now - this.lastRefill) / 1000;
        this.tokens = Math.min(this.burst, this.tokens + elapsedSeconds * this.ratePerSecond);
        this.lastRefill = now;
    }
}
//# sourceMappingURL=rate-limiter.js.map