import { ArrowRight, Label, SectionHeader } from "@visorhq/ui";
import { Fragment } from "react";

import { reveal } from "../reveal.ts";

const nodes = [
    {
        who: "Your app",
        title: "Capture",
        body: "When the response finishes, the middleware notes the route template, status and duration. Thrown errors get a stack.",
        foot: "In process · off the request path",
    },
    {
        who: "SDK",
        title: "Batch",
        body: "Events queue in memory behind a hard cap and leave every few seconds. If Visor is unreachable they are dropped and counted. Your app never waits.",
        foot: "HTTPS · retry with backoff",
    },
    {
        who: "Visor server",
        title: "Ingest",
        body: "The key is checked, the batch validated against a versioned contract, retries ignored, rows written in bulk.",
        foot: "Postgres · raw events",
    },
    {
        who: "Jobs",
        title: "Roll up",
        body: "Per-minute stats per route with mergeable latency histograms, so p95 is right over any range. Errors grouped into issues. Old data deleted on schedule.",
        foot: "Every minute · safe to rerun",
    },
    {
        who: "You",
        title: "Act",
        body: "Read it on the dashboard, get the alert by email or Slack, or let your coding agent pull it over MCP and close the loop.",
        foot: "Read key · read-only",
        last: true,
    },
];

export function DataFlow() {
    return (
        <section>
            <SectionHeader
                index="02"
                title="How the data moves"
                note="From a request in your app to a fix in your repo."
            />
            <div className="border-b border-line bg-panel px-6 py-12 lg:px-10 lg:py-14">
                <div className="grid grid-cols-1 items-stretch lg:grid-cols-[1fr_28px_1fr_28px_1fr_28px_1fr_28px_1fr]">
                    {nodes.map((n, i) => (
                        <Fragment key={n.title}>
                            {i > 0 ? (
                                <div
                                    {...reveal(i * 2 - 1)}
                                    className="flex items-center justify-center py-2 text-muted lg:py-0"
                                >
                                    <ArrowRight className="rotate-90 lg:rotate-0" />
                                </div>
                            ) : null}
                            <div
                                {...reveal(i * 2)}
                                className={`flex flex-col gap-3 border bg-bg p-5 ${n.last ? "border-accent" : "border-line-strong"}`}
                            >
                                <div className="flex items-center justify-between">
                                    <Label className={n.last ? "text-accent" : ""}>{n.who}</Label>
                                    <span className="size-2 bg-accent" />
                                </div>
                                <h3 className="font-display text-[22px] font-bold tracking-[-0.02em] text-fg">
                                    {n.title}
                                </h3>
                                <p className="text-xs leading-[1.7] text-fg-2">{n.body}</p>
                                <Label className="mt-auto border-t border-line pt-2.5">
                                    {n.foot}
                                </Label>
                            </div>
                        </Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
}
