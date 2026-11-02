import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router";

import { Label } from "@visorhq/ui";

import { ApiError } from "../api/client.ts";
import { getOrganization } from "../api/organizations.ts";
import type { Organization } from "../api/organizations.ts";
import { createProject, listProjects } from "../api/projects.ts";
import type { Project } from "../api/projects.ts";
import { Spinner } from "../components/spinner.tsx";

const field =
    "border border-line bg-surface px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-line-strong";

function message(caught: unknown): string {
    return caught instanceof ApiError ? caught.message : "Something went wrong";
}

type CreateProjectProps = {
    organizationId: string;
    onCreated: (created: Project) => void;
    hideLabel?: boolean;
};

function CreateProject({ organizationId, onCreated, hideLabel = false }: CreateProjectProps) {
    const [name, setName] = useState("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(undefined);
        setSubmitting(true);

        try {
            onCreated(await createProject(organizationId, name.trim()));
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
                <label htmlFor="project-name" className={hideLabel ? "sr-only" : "label"}>
                    Project name
                </label>
                <input
                    id="project-name"
                    type="text"
                    required
                    placeholder="shop-api"
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
                {submitting ? "Creating…" : "Create project"}
            </button>
        </form>
    );
}

export function OrganizationPage() {
    const { organizationId } = useParams<{ organizationId: string }>();

    const [organization, setOrganization] = useState<Organization | undefined>(undefined);
    const [projects, setProjects] = useState<Project[] | undefined>(undefined);
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (organizationId === undefined) {
            return;
        }

        let ignore = false;

        async function load(id: string) {
            try {
                const [found, list] = await Promise.all([getOrganization(id), listProjects(id)]);
                if (!ignore) {
                    setOrganization(found);
                    setProjects(list);
                }
            } catch (caught) {
                if (!ignore) {
                    setError(message(caught));
                }
            }
        }

        void load(organizationId);

        return () => {
            ignore = true;
        };
    }, [organizationId]);

    function onCreated(created: Project) {
        setProjects((current) => [...(current ?? []), created]);
    }

    if (error !== undefined) {
        return (
            <p role="alert" className="text-[13px] text-critical">
                {error}
            </p>
        );
    }

    if (organizationId === undefined || organization === undefined || projects === undefined) {
        return <Spinner label="Loading projects…" />;
    }

    return (
        <section className="flex flex-col gap-10">
            <div className="flex flex-col gap-3">
                <Label>{organization.role}</Label>
                <h1 className="font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-fg">
                    {organization.name}
                </h1>
            </div>
            {projects.length === 0 ? (
                <div className="flex flex-col gap-7">
                    <p className="max-w-[520px] text-sm leading-[1.75] text-fg-2">
                        No projects yet. A project is one API, and it gets its own ingest key.
                    </p>
                    <CreateProject organizationId={organizationId} onCreated={onCreated} />
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-4">
                        <Label>Projects</Label>
                        <ul className="flex max-w-[720px] flex-col border-t border-line">
                            {projects.map((project) => (
                                <li
                                    key={project.id}
                                    className="flex items-center justify-between gap-6 border-b border-line py-3.5"
                                >
                                    <Link
                                        to={`/orgs/${organizationId}/projects/${project.id}`}
                                        className="text-sm text-fg underline-offset-4 hover:underline"
                                    >
                                        {project.name}
                                    </Link>
                                    <span className="text-xs text-muted">
                                        {new Date(project.createdAt).toLocaleDateString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Label>New project</Label>
                        <CreateProject
                            organizationId={organizationId}
                            onCreated={onCreated}
                            hideLabel
                        />
                    </div>
                </>
            )}
        </section>
    );
}
