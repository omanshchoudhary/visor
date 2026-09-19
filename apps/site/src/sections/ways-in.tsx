import { Button, Label, SectionHeader } from "@visorhq/ui";

import { reveal } from "../reveal.ts";

const hostedSteps = [
    "Create an account and a project. No card needed.",
    "Copy the ingest key from the project page.",
    "Run pnpm add @visorhq/node and mount the middleware.",
    "The setup screen flips to live when the first batch arrives.",
];

const compose = [
    ["$", "git clone https://github.com/omanshchoudhary/visor"],
    ["$", "cd visor && cp .env.example .env"],
    ["$", "docker compose up"],
    ["#", "Dashboard on :5173 · API on :3000 · migrations on start"],
];

const fits = [
    ["A side-project API", "Know when it breaks without running a pager rotation."],
    [
        "A small team with no observability",
        "Routes, errors and deploys on one screen by the afternoon.",
    ],
    [
        "An agency running many client APIs",
        "One org per client, one key per project, one dashboard.",
    ],
    ["A team that ships with agents", "The fix loop closes without anyone copying logs around."],
];

export function WaysIn() {
    return (
        <section id="self-host">
            <SectionHeader
                index="08"
                title="Pick a way in"
                note="Hosted in a minute, or your own server in one command."
            />
            <div className="grid grid-cols-1 border-b border-line lg:grid-cols-2">
                <div
                    {...reveal(0)}
                    className="flex flex-col gap-5 border-b border-line px-6 py-12 lg:border-r lg:border-b-0 lg:pr-10 lg:pl-14"
                >
                    <Label className="text-accent">Hosted</Label>
                    <h2 className="font-display text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-fg">
                        Sign up, paste the key, watch the first event land.
                    </h2>
                    <ol className="flex flex-col gap-2.5 text-[13px] leading-[1.6] text-fg-2">
                        {hostedSteps.map((s, i) => (
                            <li key={s} className="flex gap-3.5">
                                <span className="text-muted">{i + 1}</span>
                                <span>{s}</span>
                            </li>
                        ))}
                    </ol>
                    <div className="flex flex-wrap gap-3">
                        <Button href="#top">Create an account</Button>
                        <Button variant="secondary" href="#top">
                            Open the live demo
                        </Button>
                    </div>
                </div>
                <div {...reveal(1)} className="flex flex-col gap-5 px-6 py-12 lg:pr-14 lg:pl-10">
                    <Label className="text-accent">Self-host</Label>
                    <h2 className="font-display text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-fg">
                        Your server. Your data. One command.
                    </h2>
                    <div className="flex flex-col overflow-x-auto border border-line-strong bg-panel px-5 py-[18px] text-[13px] leading-8 whitespace-nowrap text-fg">
                        {compose.map(([prompt, text]) => (
                            <div
                                key={text}
                                className={`flex gap-2.5 ${prompt === "#" ? "text-muted" : ""}`}
                            >
                                <span className="text-muted">{prompt}</span>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-[13px] leading-[1.7] text-fg-2">
                        Postgres, the server and the dashboard. The first account becomes the owner,
                        and public sign-up can be switched off. Upgrade by pulling the next tag.
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 border-b border-line sm:grid-cols-2 lg:grid-cols-4">
                {fits.map(([who, what], i) => (
                    <div
                        key={who}
                        {...reveal(i)}
                        className={`flex flex-col gap-2 px-6 py-7 lg:px-8 ${i < fits.length - 1 ? "border-b border-line lg:border-r lg:border-b-0" : ""} ${i % 2 === 0 ? "sm:border-r sm:border-line" : ""}`}
                    >
                        <span className="text-[13px] text-fg">{who}</span>
                        <span className="text-xs leading-[1.6] text-muted">{what}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}
