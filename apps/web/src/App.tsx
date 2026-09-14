import { useEffect, useState } from "react";

type Status = "checking" | "healthy" | "down";
export function App() {
    const [status, setStatus] = useState<Status>("checking");
    useEffect(() => {
        const controller = new AbortController();
        async function checkHealth() {
            try {
                const res = await fetch("/health", {
                    signal: AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]),
                });
                if (res.ok) {
                    setStatus("healthy");
                } else {
                    setStatus("down");
                }
            } catch {
                if (!controller.signal.aborted) {
                    setStatus("down");
                }
            }
        }
        void checkHealth();
        return () => controller.abort();
    }, []);
    return (
        <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Visor Dashboard</h1>
            <p>
                System Status:{" "}
                <strong>
                    {status === "checking" && "checking…"}
                    {status === "healthy" && "healthy (server and database up)"}
                    {status === "down" && "down"}
                </strong>
            </p>
        </main>
    );
}
