import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";

import { Wordmark } from "@visorhq/ui";

import { ApiError } from "../api/client.ts";
import { useAuth } from "../auth/context.ts";

const field =
    "border border-line bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-line-strong";

export function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);

    const state = location.state as { from?: { pathname?: string } } | null;
    const from = state?.from?.pathname ?? "/";

    if (user !== null) {
        return <Navigate to={from} replace />;
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(undefined);
        setSubmitting(true);

        try {
            await login(email, password);
            await navigate(from, { replace: true });
        } catch (caught) {
            setError(caught instanceof ApiError ? caught.message : "Something went wrong");
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-bg px-5">
            <div className="flex w-full max-w-[360px] flex-col gap-7">
                <Wordmark />
                <h1 className="font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-fg">
                    Sign in
                </h1>
                <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="label">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            className={field}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="password" className="label">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className={field}
                        />
                    </div>
                    {error === undefined ? null : (
                        <p role="alert" className="text-[13px] text-critical">
                            {error}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-accent px-[22px] py-[13px] text-sm font-semibold text-accent-fg disabled:opacity-60"
                    >
                        {submitting ? "Signing in…" : "Sign in"}
                    </button>
                </form>
                <p className="text-[13px] text-fg-2">
                    No account yet?{" "}
                    <Link to="/register" className="text-fg underline underline-offset-4">
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    );
}
