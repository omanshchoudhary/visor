import { Button, Command, Label, Wordmark } from "@visorhq/ui";

import { reveal } from "../reveal.ts";

export function Cta() {
    return (
        <section className="grid-bg relative flex flex-col items-center gap-7 border-b border-line px-6 py-20 text-center lg:py-24">
            <div className="glow-center pointer-events-none absolute inset-0" />
            <div {...reveal(0)} className="relative">
                <Wordmark size="lg" className="gap-4" />
            </div>
            <p {...reveal(1)} className="relative text-[15px] text-fg-2">
                Your API, watched. Your agent, informed.
            </p>
            <div
                {...reveal(2)}
                className="relative flex flex-wrap items-stretch justify-center gap-3"
            >
                <Command command="pnpm add @visorhq/node" />
                <Button href="https://github.com/omanshchoudhary/visor">Star on GitHub</Button>
            </div>
            <div {...reveal(3)} className="relative">
                <Label>MIT · Self-hosted or hosted · No card</Label>
            </div>
        </section>
    );
}
