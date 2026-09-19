import { Label, SectionHeader } from "@visorhq/ui";

import { reveal } from "../reveal.ts";

const tiles = [
    ["Added per request", "µs", "Measured at p99 on the request path, Visor on vs off."],
    ["Sustained ingest", "ev/s", "Five minutes, zero errors, one laptop."],
    ["SDK memory, worst case", "MB", "Queue full, Visor unreachable for an hour."],
];

export function Overhead() {
    return (
        <section>
            <SectionHeader
                index="06"
                title="Overhead"
                note="Measured, not promised. Numbers land with the first release."
            />
            <div className="grid grid-cols-1 border-b border-line lg:grid-cols-12">
                <div
                    {...reveal(0)}
                    className="flex flex-col gap-5 border-b border-line px-6 py-12 lg:col-span-5 lg:border-r lg:border-b-0 lg:pr-10 lg:pl-14"
                >
                    <h2 className="font-display text-[40px] leading-[1.05] font-bold tracking-[-0.03em] text-fg">
                        Costs nothing you would notice.
                    </h2>
                    <p className="text-sm leading-[1.75] text-fg-2">
                        Every number here comes from a script in the repo, run on one laptop against
                        the sample app with Visor switched on and off. Run it yourself and paste the
                        table anywhere.
                    </p>
                    <div className="flex items-center justify-between gap-4 border border-line-strong bg-panel px-[18px] py-3.5 text-[13px] text-fg">
                        <span className="flex gap-2.5">
                            <span className="text-muted">$</span>
                            <span>pnpm bench</span>
                        </span>
                        <Label className="text-accent">How we measure →</Label>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-3 lg:col-span-7">
                    {tiles.map(([label, unit, note], i) => (
                        <div
                            key={label}
                            {...reveal(i + 1)}
                            className="flex flex-col gap-3.5 bg-bg px-7 py-10"
                        >
                            <Label>{label}</Label>
                            <div className="flex items-baseline gap-1.5">
                                <span className="font-display text-5xl leading-none font-bold tracking-[-0.03em] text-muted">
                                    [TBD]
                                </span>
                                <span className="text-sm text-fg-2">{unit}</span>
                            </div>
                            <span className="text-xs leading-[1.6] text-muted">{note}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
