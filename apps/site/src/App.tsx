import { Hero } from "./sections/hero.tsx";
import { Nav } from "./sections/nav.tsx";
import { Ticker } from "./sections/ticker.tsx";

export function App() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-bg text-fg">
            <Nav />
            <Ticker />
            <main className="mx-auto max-w-[1200px] border-x border-line">
                <Hero />
            </main>
        </div>
    );
}
