import { Commitments } from "./sections/commitments.tsx";
import { DataFlow } from "./sections/data-flow.tsx";
import { Hero } from "./sections/hero.tsx";
import { HowItWorks } from "./sections/how-it-works.tsx";
import { Nav } from "./sections/nav.tsx";
import { Ticker } from "./sections/ticker.tsx";
import { WhatYouGet } from "./sections/what-you-get.tsx";

export function App() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-bg text-fg">
            <Nav />
            <Ticker />
            <main className="mx-auto max-w-[1200px] border-x border-line">
                <Hero />
                <Commitments />
                <HowItWorks />
                <DataFlow />
                <WhatYouGet />
            </main>
        </div>
    );
}
