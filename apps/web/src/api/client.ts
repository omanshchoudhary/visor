export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

const BASE = "/api";

let accessToken: string | undefined;
let refreshing: Promise<boolean> | undefined;

export function setAccessToken(token: string | undefined): void {
    accessToken = token;
}

export function getAccessToken(): string | undefined {
    return accessToken;
}

// builds and fires a single raw HTTP call with auth headers attached.
function request(method: Method, path: string, body?: unknown): Promise<Response> {
    return fetch(`${BASE}${path}`, {
        method,
        headers: {
            ...(accessToken === undefined ? {} : { authorization: `Bearer ${accessToken}` }),
            ...(body === undefined ? {} : { "content-type": "application/json" }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });
}

async function refreshAccessToken(): Promise<boolean> {
    refreshing ??= (async () => {
        const response = await fetch(`${BASE}/auth/refresh`, { method: "POST" });

        if (!response.ok) {
            accessToken = undefined;
            return false;
        }

        const body = (await response.json()) as { accessToken: string };
        accessToken = body.accessToken;
        return true;
    })().finally(() => {
        refreshing = undefined;
    });

    return refreshing;
}

async function errorFrom(response: Response): Promise<ApiError> {
    try {
        const body = (await response.json()) as { error?: string };
        return new ApiError(response.status, body.error ?? response.statusText);
    } catch {
        return new ApiError(response.status, response.statusText);
    }
}

// orchestrates a request, retrying once via token refresh on 401, then parses JSON/errors.
async function send<T>(method: Method, path: string, body?: unknown): Promise<T> {
    let response = await request(method, path, body);

    if (response.status === 401 && !path.startsWith("/auth/")) {
        if (await refreshAccessToken()) {
            response = await request(method, path, body);
        }
    }

    if (!response.ok) {
        throw await errorFrom(response);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return (await response.json()) as T;
}

export const api = {
    get: <T>(path: string) => send<T>("GET", path),
    post: <T>(path: string, body?: unknown) => send<T>("POST", path, body),
    patch: <T>(path: string, body?: unknown) => send<T>("PATCH", path, body),
    delete: <T>(path: string) => send<T>("DELETE", path),
};
