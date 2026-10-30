import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import { Wordmark } from "@visorhq/ui";

import { ApiError, api } from "../api/client.ts";
import { useAuth } from "../auth/context.ts";

const field =
    "border border-line bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-line-strong";

export function Register() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);

    if (user !== null) {
        return <Navigate to="/" replace />;
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(undefined);
        setSubmitting(true);

        try {
            await api.post("/auth/register", { email, name, password });
            await login(email, password);
            await navigate("/", { replace: true });
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
                    Create an account
                </h1>
                <form onSubmit={(event) => void onSubmit(event)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="name" className="label">
                            Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            className={field}
                        />
                    </div>
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
                            autoComplete="new-password"
                            required
                            minLength={8}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className={field}
                        />
                        <span className="text-xs text-muted">At least 8 characters.</span>
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
                        {submitting ? "Creating…" : "Create account"}
                    </button>
                </form>
                <p className="text-[13px] text-fg-2">
                    Already have one?{" "}
                    <Link to="/login" className="text-fg underline underline-offset-4">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}
