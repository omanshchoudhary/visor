import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router";

import { Label } from "@visorhq/ui";

import { createApiKey, listApiKeys, revokeApiKey } from "../api/api-keys.ts";
import type { ApiKey, ApiKeyType, CreatedApiKey } from "../api/api-keys.ts";
import { ApiError } from "../api/client.ts";
import { getProject } from "../api/projects.ts";
import type { Project } from "../api/projects.ts";
import { Spinner } from "../components/spinner.tsx";

const field =
    "border border-line bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-line-strong";

function message(caught: unknown): string {
    return caught instanceof ApiError ? caught.message : "Something went wrong";
}

function formatDate(value: string | null): string {
    return value === null ? "never" : new Date(value).toLocaleDateString();
}

function RevealedKey({ created, onDismiss }: { created: CreatedApiKey; onDismiss: () => void }) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        await navigator.clipboard.writeText(created.key);
        setCopied(true);
    }

    return (
        <div className="flex max-w-[720px] flex-col gap-4 border border-accent bg-panel px-6 py-5">
            <div className="flex flex-col gap-2">
                <Label className="text-accent">Copy this key now</Label>
                <p className="text-[13px] leading-[1.7] text-fg-2">
                    This is the only time {created.name} is shown in full. Once you leave this page
                    it can never be read again, only revoked and replaced.
                </p>
            </div>
            <code className="overflow-x-auto border border-line-strong bg-window px-[18px] py-3.5 text-[13px] whitespace-nowrap text-fg">
                {created.key}
            </code>
            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={() => void copy()}
                    className="bg-accent px-[22px] py-[13px] text-sm font-semibold text-accent-fg"
                >
                    {copied ? "Copied" : "Copy"}
                </button>
                <button
                    type="button"
                    onClick={onDismiss}
                    className="border border-line-strong px-[22px] py-[13px] text-sm text-fg"
                >
                    Done
                </button>
            </div>
        </div>
    );
}

type CreateApiKeyProps = {
    organizationId: string;
    projectId: string;
    onCreated: (created: CreatedApiKey) => void;
};

function CreateApiKey({ organizationId, projectId, onCreated }: CreateApiKeyProps) {
    const [name, setName] = useState("");
    const [type, setType] = useState<ApiKeyType>("INGEST");
    const [error, setError] = useState<string | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(undefined);
        setSubmitting(true);

        try {
            onCreated(await createApiKey(organizationId, projectId, name.trim(), type));
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
                <label htmlFor="key-name" className="label">
                    Key name
                </label>
                <input
                    id="key-name"
                    type="text"
                    required
                    placeholder="production"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={field}
                />
            </div>
            <div className="flex flex-col gap-2">
                <label htmlFor="key-type" className="label">
                    Type
                </label>
                <select
                    id="key-type"
                    value={type}
                    onChange={(event) => setType(event.target.value as ApiKeyType)}
                    className={field}
                >
                    <option value="INGEST">Ingest — write only, for the SDK</option>
                    <option value="READ">Read — read only, for MCP</option>
                </select>
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
                {submitting ? "Creating…" : "Create key"}
            </button>
        </form>
    );
}

function ApiKeyRow({ apiKey, onRevoke }: { apiKey: ApiKey; onRevoke: () => Promise<void> }) {
    const [confirming, setConfirming] = useState(false);
    const [revoking, setRevoking] = useState(false);

    async function revoke() {
        setRevoking(true);
        try {
            await onRevoke();
        } finally {
            setRevoking(false);
            setConfirming(false);
        }
    }

    return (
        <li className="flex flex-wrap items-center justify-between gap-4 border-b border-line py-3.5">
            <div className="flex min-w-0 flex-col gap-1">
                <span className="text-sm text-fg">{apiKey.name}</span>
                <span className="text-xs text-muted">
                    {apiKey.keyPrefix}… · last used {formatDate(apiKey.lastUsedAt)}
                </span>
            </div>
            <div className="flex items-center gap-5">
                <Label className="text-fg-2">{apiKey.type}</Label>
                {apiKey.revokedAt === null ? (
                    confirming ? (
                        <span className="flex items-center gap-3">
                            <button
                                type="button"
                                disabled={revoking}
                                onClick={() => void revoke()}
                                className="text-xs text-critical disabled:opacity-60"
                            >
                                {revoking ? "Revoking…" : "Confirm"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirming(false)}
                                className="text-xs text-fg-2"
                            >
                                Cancel
                            </button>
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirming(true)}
                            className="text-xs text-fg-2 hover:text-fg"
                        >
                            Revoke
                        </button>
                    )
                ) : (
                    <Label className="text-critical">Revoked</Label>
                )}
            </div>
        </li>
    );
}

export function ProjectPage() {
    const { organizationId, projectId } = useParams<{
        organizationId: string;
        projectId: string;
    }>();

    const [project, setProject] = useState<Project | undefined>(undefined);
    const [keys, setKeys] = useState<ApiKey[] | undefined>(undefined);
    const [created, setCreated] = useState<CreatedApiKey | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (organizationId === undefined || projectId === undefined) {
            return;
        }

        let ignore = false;

        async function load(orgId: string, id: string) {
            try {
                const [found, list] = await Promise.all([
                    getProject(orgId, id),
                    listApiKeys(orgId, id),
                ]);
                if (!ignore) {
                    setProject(found);
                    setKeys(list);
                }
            } catch (caught) {
                if (!ignore) {
                    setError(message(caught));
                }
            }
        }

        void load(organizationId, projectId);

        return () => {
            ignore = true;
        };
    }, [organizationId, projectId]);

    function onCreated(key: CreatedApiKey) {
        setCreated(key);
        setKeys((current) => [...(current ?? []), key]);
    }

    async function onRevoke(apiKeyId: string) {
        if (organizationId === undefined || projectId === undefined) {
            return;
        }

        try {
            await revokeApiKey(organizationId, projectId, apiKeyId);
            setKeys((current) =>
                current?.map((key) =>
                    key.id === apiKeyId ? { ...key, revokedAt: new Date().toISOString() } : key,
                ),
            );
        } catch (caught) {
            setError(message(caught));
        }
    }

    if (error !== undefined) {
        return (
            <p role="alert" className="text-[13px] text-critical">
                {error}
            </p>
        );
    }

    if (project === undefined || keys === undefined) {
        return <Spinner label="Loading keys…" />;
    }

    return (
        <section className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
                <Label>Project</Label>
                <h1 className="font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-fg">
                    {project.name}
                </h1>
            </div>
            {created === undefined ? null : (
                <RevealedKey
                    created={created}
                    onDismiss={() => {
                        setCreated(undefined);
                    }}
                />
            )}
            {keys.length === 0 ? (
                <p className="max-w-[520px] text-sm leading-[1.75] text-fg-2">
                    No keys yet. An ingest key lets the SDK send events. A read key lets MCP read
                    them back.
                </p>
            ) : (
                <div className="flex flex-col gap-4">
                    <Label>API keys</Label>
                    <ul className="flex max-w-[720px] flex-col border-t border-line">
                        {keys.map((key) => (
                            <ApiKeyRow
                                key={key.id}
                                apiKey={key}
                                onRevoke={() => onRevoke(key.id)}
                            />
                        ))}
                    </ul>
                </div>
            )}
            <div className="flex flex-col gap-4">
                <Label>New key</Label>
                <CreateApiKey
                    organizationId={organizationId ?? ""}
                    projectId={projectId ?? ""}
                    onCreated={onCreated}
                />
            </div>
        </section>
    );
}
