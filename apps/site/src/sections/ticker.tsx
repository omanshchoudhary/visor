import { Label } from "@visorhq/ui";

const requests = [
    ["GET", "/products", 200, "96 ms"],
    ["POST", "/checkout", 500, "612 ms"],
    ["GET", "/orders/:id", 200, "388 ms"],
    ["GET", "/search", 200, "341 ms"],
    ["POST", "/auth/login", 200, "220 ms"],
    ["GET", "/products", 200, "91 ms"],
    ["POST", "/checkout", 200, "205 ms"],
    ["GET", "/orders/:id", 404, "12 ms"],
    ["GET", "/products", 200, "88 ms"],
    ["GET", "/search", 200, "352 ms"],
    ["POST", "/checkout", 200, "198 ms"],
] as const;

const loop = [...requests, ...requests];

function statusColor(status: number): string {
    if (status >= 500) return "text-critical";
    if (status >= 400) return "text-warning";
    return "text-fg-2";
}

export function Ticker() {
    return (
        <div className="flex items-center overflow-hidden border-b border-line text-[11px] whitespace-nowrap text-muted">
            <div className="flex shrink-0 items-center gap-2 border-r border-line py-[11px] pr-5 pl-5 lg:pl-10">
                <span className="size-[7px] rounded-full bg-good" />
                <Label className="text-fg-2">Live</Label>
                <span className="text-fg-2">shop-api</span>
            </div>
            <div className="fade-x min-w-0 grow overflow-hidden py-[11px]">
                <div className="animate-ticker flex w-max hover:[animation-play-state:paused]">
                    {loop.map(([method, route, status, ms], i) => (
                        <div
                            key={i}
                            className="pl-9"
                            aria-hidden={i >= requests.length ? true : undefined}
                        >
                            {method} {route} <span className={statusColor(status)}>{status}</span>{" "}
                            {ms}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
