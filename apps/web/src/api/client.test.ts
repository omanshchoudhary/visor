import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, api, getAccessToken, setAccessToken } from "./client.ts";

type Reply = { status: number; body?: unknown };

function reply({ status, body }: Reply): Response {
    return new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: body === undefined ? {} : { "content-type": "application/json" },
    });
}

const fetchMock = vi.fn<(input: string, init?: RequestInit) => Promise<Response>>();

function calls(): { url: string; init: RequestInit | undefined }[] {
    return fetchMock.mock.calls.map(([url, init]) => ({ url, init }));
}

beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    setAccessToken(undefined);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("api client", () => {
    it("sends no authorization header until a token is set", async () => {
        fetchMock.mockResolvedValueOnce(reply({ status: 200, body: { ok: true } }));

        await api.get("/users/me");

        expect(calls()[0]?.init?.headers).toEqual({});
    });

    it("attaches the access token as a bearer header", async () => {
        setAccessToken("token-1");
        fetchMock.mockResolvedValueOnce(reply({ status: 200, body: { ok: true } }));

        await api.get("/users/me");

        expect(calls()[0]?.init?.headers).toMatchObject({ authorization: "Bearer token-1" });
    });

    it("refreshes once on a 401 and retries the original request", async () => {
        setAccessToken("expired");
        fetchMock
            .mockResolvedValueOnce(reply({ status: 401, body: { error: "Unauthorized" } }))
            .mockResolvedValueOnce(reply({ status: 200, body: { accessToken: "token-2" } }))
            .mockResolvedValueOnce(reply({ status: 200, body: { id: "u1" } }));

        const user = await api.get<{ id: string }>("/users/me");

        expect(user).toEqual({ id: "u1" });
        expect(calls().map((call) => call.url)).toEqual([
            "/api/users/me",
            "/api/auth/refresh",
            "/api/users/me",
        ]);
        expect(calls()[2]?.init?.headers).toMatchObject({ authorization: "Bearer token-2" });
        expect(getAccessToken()).toBe("token-2");
    });

    it("refreshes once when several requests get a 401 together", async () => {
        setAccessToken("expired");
        fetchMock.mockImplementation((url) => {
            if (url === "/api/auth/refresh") {
                return Promise.resolve(reply({ status: 200, body: { accessToken: "token-2" } }));
            }
            return Promise.resolve(
                getAccessToken() === "token-2"
                    ? reply({ status: 200, body: { url } })
                    : reply({ status: 401, body: { error: "Unauthorized" } }),
            );
        });

        await Promise.all([api.get("/users/me"), api.get("/orgs"), api.get("/orgs/a/projects")]);

        const refreshes = calls().filter((call) => call.url === "/api/auth/refresh");
        expect(refreshes).toHaveLength(1);
    });

    it("gives up and clears the token when the refresh itself fails", async () => {
        setAccessToken("expired");
        fetchMock
            .mockResolvedValueOnce(reply({ status: 401, body: { error: "Unauthorized" } }))
            .mockResolvedValueOnce(
                reply({ status: 401, body: { error: "Invalid refresh token" } }),
            );

        await expect(api.get("/users/me")).rejects.toThrow(ApiError);
        expect(getAccessToken()).toBeUndefined();
        expect(calls()).toHaveLength(2);
    });

    it("never tries to refresh a failed login", async () => {
        fetchMock.mockResolvedValueOnce(
            reply({ status: 401, body: { error: "Invalid email or password" } }),
        );

        await expect(api.post("/auth/login", { email: "a@b.c", password: "x" })).rejects.toThrow(
            "Invalid email or password",
        );
        expect(calls()).toHaveLength(1);
    });

    it("carries the status and message of a failed request", async () => {
        fetchMock.mockResolvedValueOnce(reply({ status: 409, body: { error: "Email taken" } }));

        const error = await api.post("/auth/register", {}).catch((caught: unknown) => caught);

        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(409);
        expect((error as ApiError).message).toBe("Email taken");
    });

    it("returns nothing for a 204", async () => {
        fetchMock.mockResolvedValueOnce(reply({ status: 204 }));

        await expect(api.delete("/users/me")).resolves.toBeUndefined();
    });

    it("sends a json body with a content type", async () => {
        fetchMock.mockResolvedValueOnce(reply({ status: 201, body: { id: "o1" } }));

        await api.post("/orgs", { name: "Acme" });

        expect(calls()[0]?.init?.headers).toMatchObject({ "content-type": "application/json" });
        expect(calls()[0]?.init?.body).toBe(JSON.stringify({ name: "Acme" }));
    });
});
