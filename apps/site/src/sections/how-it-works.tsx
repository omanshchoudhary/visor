import { Label, SectionHeader } from "@visorhq/ui";

import { reveal } from "../reveal.ts";

const steps = [
    {
        tag: "01 / Install",
        title: "Add one line.",
        body: "Mount the middleware with your ingest key. Every request is recorded with its route template, status and duration, batched in memory and sent in the background. If Visor is down, your app never notices.",
    },
    {
        tag: "02 / Watch",
        title: "See what is slow and what is breaking.",
        body: "Per-minute rollups with correct p50 and p95. Errors grouped into issues with stack traces, tagged with the commit that shipped them. Alerts by email or Slack: once when it fires, once when it recovers.",
    },
    {
        tag: "03 / Fix",
        title: "Hand the evidence to your agent.",
        body: "Connect your coding agent over MCP. It reads the failing route, the stack and the commit that caused it, fixes the code, and after the deploy checks Visor to confirm the error rate is back to normal.",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works">
            <SectionHeader
                index="01"
                title="How it works"
                note="Three steps. Nothing else runs in your stack."
            />
            <div className="border-b border-line px-6 pt-12 pb-14 lg:px-14">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                    {steps.map((s, i) => (
                        <div
                            key={s.tag}
                            {...reveal(i)}
                            className="relative flex flex-col gap-4 border-t border-line-strong pt-8"
                        >
                            <span className="absolute top-[-6px] left-0 size-[11px] bg-accent" />
                            <Label className="text-accent">{s.tag}</Label>
                            <h3 className="font-display text-[28px] leading-tight font-bold tracking-[-0.02em] text-fg">
                                {s.title}
                            </h3>
                            <p className="text-[13px] leading-[1.75] text-fg-2">{s.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
