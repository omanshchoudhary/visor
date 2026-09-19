import { Label, SectionHeader } from "@visorhq/ui";

import { reveal } from "../reveal.ts";

const rows = [
    [
        "Routes",
        "Every endpoint, ranked.",
        "Volume, error rate and p50 / p95 / p99 per route template. Unmatched routes share one bucket, so the list stays bounded.",
    ],
    [
        "Errors",
        "Stack traces, grouped.",
        "Occurrences of the same bug fold into one issue with first seen, last seen and affected routes. Secrets are scrubbed before they leave your process.",
    ],
    [
        "Deploys",
        "Errors started after a1f9c2e.",
        "Every event carries the release it came from. Compare error rate and p95 before and after any deploy, and see which one made things worse.",
    ],
    [
        "Alerts",
        "Once when it fires. Once when it recovers.",
        "Error rate, p95, new issue, regression. Email or Slack, with a cooldown so a flapping route cannot spam the channel.",
    ],
    [
        "MCP",
        "Evidence for your coding agent.",
        "Read-only tools: health, issues, route stats, deploy comparisons. Scoped to a key. Visor never touches your code and runs no model of its own.",
    ],
    [
        "Self-host",
        "Postgres, server, web. Nothing else.",
        "One compose file. No Redis, no queue, no vendor. The hosted demo runs the exact setup you get.",
    ],
];

export function WhatYouGet() {
    return (
        <section>
            <SectionHeader
                index="03"
                title="What you get"
                note="The parts that matter. No dashboard theatre."
            />
            <div className="flex flex-col border-b border-line">
                {rows.map(([label, title, body], i) => (
                    <div
                        key={label}
                        {...reveal(i)}
                        className={`grid grid-cols-1 gap-2 px-6 py-6 md:grid-cols-[120px_minmax(0,1fr)] md:items-baseline md:gap-x-6 lg:grid-cols-[160px_minmax(0,320px)_minmax(0,1fr)] lg:px-8 ${i < rows.length - 1 ? "border-b border-line" : ""}`}
                    >
                        <Label>{label}</Label>
                        <h3 className="font-display text-xl font-bold tracking-[-0.01em] text-fg">
                            {title}
                        </h3>
                        <p className="text-[13px] leading-[1.7] text-fg-2 md:col-start-2 lg:col-start-auto">
                            {body}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
