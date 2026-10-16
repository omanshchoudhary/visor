export class HttpError extends Error {
    readonly status: number;
    readonly retryAfter?: number;

    constructor(status: number, message: string, retryAfter?: number) {
        super(message);
        this.name = "HttpError";
        this.status = status;
        this.retryAfter = retryAfter;
    }
}
