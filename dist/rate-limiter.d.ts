export declare class RateLimiter {
    private readonly ratePerSecond;
    private readonly burst;
    private tokens;
    private lastRefill;
    constructor(ratePerSecond: number, burst: number);
    acquire(signal?: AbortSignal): Promise<void>;
    private refill;
}
