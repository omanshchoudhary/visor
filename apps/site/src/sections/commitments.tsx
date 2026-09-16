import type { ReactNode } from "react";

import { reveal } from "../reveal.ts";

const items: Array<[string, string, ReactNode]> = [
    ["1", "Line to install.", "One middleware, one key."],
    ["0", "Runtime dependencies.", "Nothing else ships into your app."],
    [
        "1",
        "Command to self-host.",
        <>
            Just <span className="text-fg">docker compose up</span>.
        </>,
    ],
    ["MIT", "Licensed.", "The server, the SDK and the MCP server alike."],
];

export function Commitments() {
    return (
        <div className="grid grid-cols-2 border-b border-line bg-surface-2 lg:grid-cols-4">
            {items.map(([value, first, second], i) => (
                <div
                    key={i}
                    {...reveal(i)}
                    className={`flex items-center gap-4 px-6 py-6 lg:px-8 ${i < 3 ? "lg:border-r lg:border-line" : ""} ${i % 2 === 0 ? "border-r border-line lg:border-r" : ""} ${i < 2 ? "border-b border-line lg:border-b-0" : ""}`}
                >
                    <span
                        className={`font-display text-[40px] leading-none font-bold tracking-[-0.03em] ${value === "0" ? "text-accent" : "text-fg"}`}
                    >
                        {value}
                    </span>
                    <span className="text-xs leading-[1.5] text-fg-2">
                        {first} <br className="hidden lg:inline" />
                        {second}
                    </span>
                </div>
            ))}
        </div>
    );
}
