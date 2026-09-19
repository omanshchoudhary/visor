import { Label, SectionHeader } from "@visorhq/ui";

import { reveal } from "../reveal.ts";

type Option = {
    name: string;
    def: string;
    code: boolean;
    does: string;
};

const options: Option[] = [
    { name: "key", def: "Required", code: false, does: "Ingest key for the project" },
    {
        name: "endpoint",
        def: "Hosted Visor",
        code: false,
        does: "Where batches go; point it at your own server",
    },
    {
        name: "release",
        def: "From CI env",
        code: false,
        does: "Commit tagged on every event and error",
    },
    { name: "flushIntervalMs", def: "5000", code: true, does: "How often a batch is sent" },
    {
        name: "maxQueueSize",
        def: "10000",
        code: true,
        does: "Hard cap; past it, the oldest events are dropped and counted",
    },
    {
        name: "sampleRate",
        def: "1",
        code: true,
        does: "Share of successful requests kept; errors are always kept",
    },
    {
        name: "redact",
        def: "Built-in list",
        code: false,
        does: "Extra keys to scrub from error context before sending",
    },
    {
        name: "debug",
        def: "false",
        code: true,
        does: "Log SDK problems to stderr once, not per request",
    },
];

const records = [
    <>
        The route template: <span className="text-fg">/users/:id</span>, never /users/42.
    </>,
    "Status code, duration and timestamp for every request.",
    "Thrown and next(err) errors, with type, message and stack.",
    "The release it ran under, from config or the CI environment.",
    "How many events it had to drop, so a gap is visible, not silent.",
];

const never = [
    "Read headers, bodies, cookies or query values.",
    "Block a request or wait on the network.",
    "Throw into your app; a problem is logged once, not per request.",
    "Grow without bound; the queue has a hard cap.",
    "Pull in dependencies: zero at runtime, no native code.",
];

const kw = "text-muted";
const str = "text-accent";

export function Sdk() {
    return (
        <section id="sdk">
            <SectionHeader
                index="04"
                title="The SDK"
                note="One middleware. It can never hurt the app it runs in."
            />
            <div className="grid grid-cols-1 border-b border-line lg:grid-cols-2">
                <div
                    {...reveal(0)}
                    className="flex flex-col gap-6 border-b border-line px-6 py-12 lg:border-r lg:border-b-0 lg:pr-10 lg:pl-14"
                >
                    <h2 className="font-display text-[40px] leading-[1.05] font-bold tracking-[-0.03em] text-fg">
                        Mount it. Forget it.
                    </h2>
                    <p className="text-sm leading-[1.75] text-fg-2">
                        The middleware sits after your routes and before your error handler. It
                        never blocks, never throws into your app, and holds a bounded queue in
                        memory. Everything else is a default you can change.
                    </p>
                    <div className="border border-line-strong bg-panel">
                        <div className="flex items-center justify-between border-b border-line px-[18px] py-2.5">
                            <span className="text-xs text-muted">src/app.ts</span>
                            <Label>TypeScript</Label>
                        </div>
                        <pre className="overflow-x-auto px-5 py-[18px] text-[13px] leading-[1.8] text-fg">
                            <span className={kw}>import</span> express{" "}
                            <span className={kw}>from</span> <span className={str}>"express"</span>;
                            {"\n"}
                            <span className={kw}>import</span> {"{ visor }"}{" "}
                            <span className={kw}>from</span>{" "}
                            <span className={str}>"@visorhq/node"</span>;{"\n\n"}
                            <span className={kw}>const</span> app = express();{"\n\n"}
                            app.use(visor({"{"}
                            {"\n"}
                            {"    "}key: process.env.VISOR_KEY,{"\n"}
                            {"    "}release: process.env.GIT_SHA,{"\n"}
                            {"}"}));{"\n\n"}
                            app.get(<span className={str}>"/orders/:id"</span>, getOrder);{"\n\n"}
                            app.use(visor.errors());{"\n"}
                            app.listen(3000);
                        </pre>
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="flex justify-between gap-6 border-b border-line px-6 py-[18px]">
                        <Label className="text-fg">Options</Label>
                        <Label className="hidden text-right sm:inline">
                            Every one has a safe default
                        </Label>
                    </div>
                    <div className="label hidden grid-cols-[150px_120px_minmax(0,1fr)] gap-4 border-b border-line px-6 py-2.5 md:grid">
                        <span>Option</span>
                        <span>Default</span>
                        <span>Does</span>
                    </div>
                    {options.map((o, i) => (
                        <div
                            key={o.name}
                            {...reveal(i)}
                            className={`grid grid-cols-1 gap-1 px-6 py-3 text-[12.5px] leading-[1.6] md:grid-cols-[150px_120px_minmax(0,1fr)] md:gap-4 ${i < options.length - 1 ? "border-b border-line" : ""}`}
                        >
                            <span className="text-accent">{o.name}</span>
                            <span className={o.code ? "text-fg" : "text-muted"}>{o.def}</span>
                            <span className="text-fg-2">{o.does}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 border-b border-line lg:grid-cols-2">
                <div className="flex flex-col gap-4 border-b border-line px-6 py-9 lg:border-r lg:border-b-0 lg:pr-10 lg:pl-14">
                    <Label className="text-fg">What it records</Label>
                    <ul className="flex flex-col gap-2.5 text-[13px] leading-[1.6] text-fg-2">
                        {records.map((r, i) => (
                            <li key={i} {...reveal(i)} className="flex gap-3.5">
                                <span className="text-good">+</span>
                                <span>{r}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col gap-4 px-6 py-9 lg:pr-14 lg:pl-10">
                    <Label className="text-fg">What it never does</Label>
                    <ul className="flex flex-col gap-2.5 text-[13px] leading-[1.6] text-fg-2">
                        {never.map((n, i) => (
                            <li key={n} {...reveal(i)} className="flex gap-3.5">
                                <span className="text-critical">-</span>
                                <span>{n}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
