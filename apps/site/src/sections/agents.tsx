import { Label, SectionHeader } from "@visorhq/ui";

import { reveal } from "../reveal.ts";

type Tone = "you" | "agent" | "muted" | "fg" | "fg2";

const tones: Record<Tone, string> = {
    you: "text-accent",
    agent: "text-muted",
    muted: "text-muted",
    fg: "text-fg",
    fg2: "text-fg-2",
};

const transcript: Array<Array<[Tone, string]>> = [
    [
        ["you", "You    "],
        ["fg", "Why is checkout failing since this morning?"],
    ],
    [],
    [
        ["agent", "Agent  "],
        ["fg2", "visor.list_issues "],
        ["muted", "project=shop-api status=open"],
    ],
    [
        ["muted", "       → "],
        ["fg", "TypeError: Cannot read properties of undefined (reading 'total')"],
    ],
    [["fg2", "         POST /checkout · 1,284 events · first seen 09:12 · release a1f9c2e"]],
    [],
    [
        ["agent", "Agent  "],
        ["fg2", "visor.deploy_compare "],
        ["muted", "release=a1f9c2e"],
    ],
    [
        ["muted", "       → "],
        ["fg2", "Error rate 0.2% → "],
        ["fg", "6.8%"],
        ["fg2", " · p95 198 → "],
        ["fg", "380 ms"],
    ],
    [],
    [
        ["agent", "Agent  "],
        ["fg2", "Reading src/checkout/total.ts at a1f9c2e"],
    ],
    [["fg2", "       The coupon change made cart.summary optional, so I'm guarding it."]],
    [["fg", "       Fix committed 7c3d0e1 · deploy started"]],
    [],
    [
        ["agent", "Agent  "],
        ["fg2", "visor.route_stats "],
        ["muted", 'route="POST /checkout" since=deploy'],
    ],
    [
        ["muted", "       → "],
        ["fg2", "Error rate "],
        ["fg", "0.1%"],
        ["fg2", " · p95 "],
        ["fg", "205 ms"],
        ["fg2", " · issue resolved"],
    ],
];

const tools = [
    [
        "project_health",
        "Requests, error rate, p50 and p95 for a range, each against the previous period",
        '"Is the API healthy right now?"',
    ],
    [
        "list_issues",
        "Open issues ranked by impact, with first seen, count and the release they started in",
        '"What broke since this morning?"',
    ],
    [
        "get_issue",
        "The stack with app frames marked, affected routes, occurrences over time and the first-seen commit",
        '"Where does the checkout error come from?"',
    ],
    [
        "route_stats",
        "Volume, error rate and latency for one route over a range",
        '"Did the fix help /checkout?"',
    ],
    [
        "list_deploys",
        "Recent releases, each with a one-line before and after summary",
        '"What shipped today?"',
    ],
    [
        "deploy_compare",
        "Error rate, p95 and traffic in a window before a deploy against a window after it",
        '"Did a1f9c2e make things worse?"',
    ],
];

const points = [
    "Read-only. A key scopes what it can see.",
    "Works with any MCP client, hosted or self-hosted.",
    "No model inside Visor. Your agent does the thinking.",
];

export function Agents() {
    return (
        <section id="agents">
            <SectionHeader
                index="05"
                title="Agents"
                note="Visor finds the problem. Your agent fixes it."
            />
            <div className="grid grid-cols-1 border-b border-line lg:grid-cols-12">
                <div
                    {...reveal(0)}
                    className="flex flex-col gap-6 border-b border-line px-6 py-12 lg:col-span-5 lg:border-r lg:border-b-0 lg:py-14 lg:pr-10 lg:pl-14"
                >
                    <h2 className="font-display text-[40px] leading-[1.05] font-bold tracking-[-0.03em] text-fg">
                        Ask what is broken. Get the fix, and the proof.
                    </h2>
                    <p className="text-sm leading-[1.75] text-fg-2">
                        Visor exposes an MCP server. Point any coding agent at it with a read key
                        and it can pull the failing route, the stack trace, the release that
                        introduced it, and after the deploy, the numbers that show the fix held.
                    </p>
                    <ul className="flex flex-col gap-2.5 text-[13px] text-fg-2">
                        {points.map((p) => (
                            <li key={p} className="flex gap-3">
                                <span className="mt-[7px] size-1.5 shrink-0 bg-accent" />
                                <span>{p}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex gap-2.5 border border-line-strong bg-panel px-[18px] py-3.5 text-[13px] text-fg">
                        <span className="text-muted">$</span>
                        <span>
                            npx @visorhq/mcp --key{" "}
                            <span className="text-muted">$VISOR_READ_KEY</span>
                        </span>
                    </div>
                </div>
                <div className="bg-panel px-6 py-10 lg:col-span-7 lg:px-10">
                    <div className="flex items-center justify-between border-b border-line pb-3.5">
                        <div className="flex items-center gap-2.5">
                            <Label>Agent session</Label>
                            <span className="text-xs text-muted">shop-api</span>
                        </div>
                        <Label className="text-accent">Via Visor MCP</Label>
                    </div>
                    <div className="overflow-x-auto pt-5 text-[12.5px] leading-[1.85] whitespace-pre">
                        {transcript.map((line, i) => (
                            <div key={i} {...reveal(i, "line")}>
                                {line.length === 0
                                    ? " "
                                    : line.map(([tone, text], j) => (
                                          <span key={j} className={tones[tone]}>
                                              {text}
                                          </span>
                                      ))}
                                {i === transcript.length - 1 ? (
                                    <span className="animate-caret ml-1.5 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] bg-accent" />
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col border-b border-line">
                <div className="flex justify-between gap-6 border-b border-line px-6 py-[18px]">
                    <Label className="text-fg">The tools it gets</Label>
                    <Label className="hidden text-right sm:inline">
                        Six, all read-only, with outputs sized for a context window
                    </Label>
                </div>
                <div className="label hidden grid-cols-[240px_minmax(0,1fr)_320px] gap-6 border-b border-line px-6 py-2.5 lg:grid">
                    <span>Tool</span>
                    <span>Returns</span>
                    <span>The question it answers</span>
                </div>
                {tools.map(([name, returns, question], i) => (
                    <div
                        key={name}
                        {...reveal(i)}
                        className={`grid grid-cols-1 gap-1 px-6 py-3.5 text-[12.5px] leading-[1.6] lg:grid-cols-[240px_minmax(0,1fr)_320px] lg:gap-6 ${i < tools.length - 1 ? "border-b border-line" : ""}`}
                    >
                        <span className="text-accent">{name}</span>
                        <span className="text-fg-2">{returns}</span>
                        <span className="text-muted">{question}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
