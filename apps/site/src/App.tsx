import { Agents } from "./sections/agents.tsx";
import { Commitments } from "./sections/commitments.tsx";
import { Cta } from "./sections/cta.tsx";
import { DataFlow } from "./sections/data-flow.tsx";
import { Footer } from "./sections/footer.tsx";
import { Hero } from "./sections/hero.tsx";
import { HowItWorks } from "./sections/how-it-works.tsx";
import { Nav } from "./sections/nav.tsx";
import { Overhead } from "./sections/overhead.tsx";
import { Sdk } from "./sections/sdk.tsx";
import { Ticker } from "./sections/ticker.tsx";
import { WaysIn } from "./sections/ways-in.tsx";
import { WhatYouGet } from "./sections/what-you-get.tsx";
import { Why } from "./sections/why.tsx";

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
                <Sdk />
                <Agents />
                <Overhead />
                <Why />
                <WaysIn />
                <Cta />
                <Footer />
            </main>
        </div>
    );
}
