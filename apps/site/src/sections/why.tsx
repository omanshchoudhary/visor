import { SectionHeader } from "@visorhq/ui";

import { reveal } from "../reveal.ts";

const cards = [
    {
        n: "01",
        tag: "The inbox",
        title: "A user tells you.",
        body: "Checkout has been failing since the morning deploy. You hear about it at lunch, from a customer, with no stack trace and no idea which commit did it.",
    },
    {
        n: "02",
        tag: "The suite",
        title: "You buy an APM.",
        body: "Traces, logs, dashboards, per-seat pricing and a sales call. Built for platform teams with a budget line, not for a two-person API.",
    },
    {
        n: "03",
        tag: "Visor",
        title: "One line, your own server.",
        body: "Requests, errors, deploys and alerts. Open source, self-hosted or hosted, and readable by the coding agent that is going to fix it.",
        us: true,
    },
];

const rows = [
    ["Setup", "Already there", "Agent, config, onboarding call", "One middleware line"],
    [
        "When something breaks",
        "A line, if you logged it",
        "Traces and dashboards",
        "The route, the stack, the commit, the alert",
    ],
    ["Who owns the data", "You", "The vendor", "You"],
    [
        "Your coding agent",
        "Pastes from your terminal",
        "Sometimes, through a plugin",
        "Read-only MCP, scoped to a key",
    ],
    ["Cost", "Your time", "Per host or per seat", "Free, MIT"],
    ["Self-host", "N/A", "Rarely", "One command"],
];

export function Why() {
    return (
        <section id="why">
            <SectionHeader index="07" title="Why Visor" note="How small teams find out today." />
            <div className="grid grid-cols-1 border-b border-line md:grid-cols-3">
                {cards.map((c, i) => (
                    <div
                        key={c.n}
                        {...reveal(i)}
                        className={`flex flex-col gap-4 px-6 py-10 lg:px-8 ${i === 0 ? "lg:pl-14" : ""} ${i === 2 ? "lg:pr-14" : ""} ${c.us ? "-mt-px border-t-2 border-accent" : "border-b border-line md:border-r md:border-b-0"}`}
                    >
                        <div className={`label flex justify-between ${c.us ? "text-accent" : ""}`}>
                            <span>{c.n}</span>
                            <span>{c.tag}</span>
                        </div>
                        <h3 className="font-display text-[26px] font-bold tracking-[-0.02em] text-fg">
                            {c.title}
                        </h3>
                        <p className="text-[13px] leading-[1.75] text-fg-2">{c.body}</p>
                    </div>
                ))}
            </div>
            <div className="flex flex-col overflow-x-auto border-b border-line">
                <div className="label grid min-w-[720px] grid-cols-[200px_1fr_1fr_1fr] gap-6 border-b border-line px-6 py-3">
                    <span>Dimension</span>
                    <span>Logs and grep</span>
                    <span>Hosted APM suite</span>
                    <span className="text-accent">Visor</span>
                </div>
                {rows.map(([dim, logs, apm, visor], i) => (
                    <div
                        key={dim}
                        {...reveal(i)}
                        className={`grid min-w-[720px] grid-cols-[200px_1fr_1fr_1fr] gap-6 px-6 py-3.5 text-[12.5px] leading-[1.6] ${i < rows.length - 1 ? "border-b border-line" : ""}`}
                    >
                        <span className="text-fg">{dim}</span>
                        <span className="text-fg-2">{logs}</span>
                        <span className="text-fg-2">{apm}</span>
                        <span className="text-fg">{visor}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
