import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router";

import { Label } from "@visorhq/ui";

import { ApiError } from "../api/client.ts";
import { createOrganization, listOrganizations } from "../api/organizations.ts";
import type { Organization } from "../api/organizations.ts";
import { Spinner } from "../components/spinner.tsx";

const field =
    "border border-line bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-line-strong";

function message(caught: unknown): string {
    return caught instanceof ApiError ? caught.message : "Something went wrong";
}

type CreateOrganizationProps = {
    onCreated: (created: Organization) => void;
    hideLabel?: boolean;
};

function CreateOrganization({ onCreated, hideLabel = false }: CreateOrganizationProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(undefined);
        setSubmitting(true);

        try {
            onCreated(await createOrganization(name.trim()));
            setName("");
        } catch (caught) {
            setError(message(caught));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form
            onSubmit={(event) => void onSubmit(event)}
            className="flex max-w-[420px] flex-col gap-4"
        >
            <div className="flex flex-col gap-2">
                <label htmlFor="organization-name" className={hideLabel ? "sr-only" : "label"}>
                    Organization name
                </label>
                <input
                    id="organization-name"
                    type="text"
                    required
                    placeholder="Acme"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
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
                disabled={submitting || name.trim() === ""}
                className="self-start bg-accent px-[22px] py-[13px] text-sm font-semibold text-accent-fg disabled:opacity-60"
            >
                {submitting ? "Creating…" : "Create organization"}
            </button>
        </form>
    );
}

export function Overview() {
    const [organizations, setOrganizations] = useState<Organization[] | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const list = await listOrganizations();
                if (!ignore) {
                    setOrganizations(list);
                }
            } catch (caught) {
                if (!ignore) {
                    setError(message(caught));
                }
            }
        }

        void load();

        return () => {
            ignore = true;
        };
    }, []);

    function onCreated(created: Organization) {
        setOrganizations((current) => [...(current ?? []), created]);
    }

    if (error !== undefined) {
        return (
            <p role="alert" className="text-[13px] text-critical">
                {error}
            </p>
        );
    }

    if (organizations === undefined) {
        return <Spinner label="Loading organizations…" />;
    }

    if (organizations.length === 0) {
        return (
            <section className="flex flex-col gap-7">
                <div className="flex max-w-[520px] flex-col gap-3">
                    <h1 className="font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-fg">
                        Create your organization
                    </h1>
                    <p className="text-sm leading-[1.75] text-fg-2">
                        An organization holds your projects, and each project gets its own ingest
                        key. One is enough to start.
                    </p>
                </div>
                <CreateOrganization onCreated={onCreated} />
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
                <Label>Organizations</Label>
                <ul className="flex max-w-[720px] flex-col border-t border-line">
                    {organizations.map((organization) => (
                        <li
                            key={organization.id}
                            className="flex items-center justify-between gap-6 border-b border-line py-3.5"
                        >
                            <Link
                                to={`/orgs/${organization.id}`}
                                className="text-sm text-fg underline-offset-4 hover:underline"
                            >
                                {organization.name}
                            </Link>
                            <span className="flex items-center gap-5 text-xs text-muted">
                                <Label className="text-fg-2">{organization.role}</Label>
                                {new Date(organization.createdAt).toLocaleDateString()}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex flex-col gap-4">
                <Label>New organization</Label>
                <CreateOrganization onCreated={onCreated} hideLabel />
            </div>
        </section>
    );
}
