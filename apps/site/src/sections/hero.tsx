import { ArrowDown, ArrowUpRight, Button, Command } from "@visorhq/ui";

import { reveal } from "../reveal.ts";
import { HeroPreview } from "./hero-preview.tsx";

export function Hero() {
    return (
        <section
            id="top"
            className="grid-bg relative grid grid-cols-1 border-b border-line lg:grid-cols-12"
        >
            <div className="glow pointer-events-none absolute inset-0" />
            <div className="grain pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen" />
            <div className="relative flex flex-col gap-6 px-6 pt-14 pb-14 lg:col-span-7 lg:pt-14 lg:pr-10 lg:pl-14 lg:pb-16">
                <div {...reveal(0)} className="flex items-center gap-2.5 text-[13px] text-fg-2">
                    <span className="size-2 bg-accent" />
                    <span>Every request recorded. Nothing in your hot path.</span>
                </div>
                <h1
                    {...reveal(1)}
                    className="font-display text-[length:clamp(44px,min(6.5vw,10.5vh),80px)] leading-[0.98] font-bold tracking-[-0.035em] text-fg"
                >
                    <span className="block">Know it broke</span>
                    <span className="block">before your</span>
                    <span className="block">
                        <span className="-ml-3.5 inline-block bg-accent px-3.5 pb-0.5 text-accent-fg">
                            users do.
                        </span>
                    </span>
                </h1>
                <p {...reveal(2)} className="max-w-[600px] text-[15px] leading-[1.75] text-fg-2">
                    Visor is open-source API monitoring for Node and Express. It records every
                    request, shows what is slow and what is breaking, and lets your coding agent{" "}
                    <strong className="font-semibold text-fg">
                        prove its fix worked in production
                    </strong>
                    .
                </p>
                <div {...reveal(3)} className="flex max-w-[600px] flex-col gap-3.5">
                    <Command command="pnpm add @visorhq/node" />
                    <div className="flex flex-wrap gap-3">
                        <Button
                            href="https://github.com/omanshchoudhary/visor"
                            icon={<ArrowUpRight />}
                        >
                            Star on GitHub
                        </Button>
                        <Button variant="secondary" href="#self-host" icon={<ArrowDown />}>
                            Open the live demo
                        </Button>
                    </div>
                </div>
            </div>
            <div className="relative px-6 pb-14 lg:col-span-5 lg:px-0 lg:pt-24 lg:pb-16">
                <div {...reveal(4)} className="lg:ml-auto lg:-mr-[100px] lg:w-[560px]">
                    <HeroPreview />
                </div>
            </div>
        </section>
    );
}
