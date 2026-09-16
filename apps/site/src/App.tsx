import { Nav } from "./sections/nav.tsx";
import { Ticker } from "./sections/ticker.tsx";

export function App() {
    return (
        <div className="min-h-screen overflow-x-hidden bg-bg text-fg">
            <Nav />
            <Ticker />
        </div>
    );
}
