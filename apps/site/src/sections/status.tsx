import { Label } from "@visorhq/ui";

export function Status() {
    return (
        <div className="flex flex-col gap-1.5 border-b border-line bg-surface-2 px-5 py-3 text-[12.5px] leading-[1.6] sm:flex-row sm:items-center sm:gap-4 lg:px-10">
            <Label className="shrink-0 text-accent">In development</Label>
            <p className="text-fg-2">
                The SDK and ingest work today. Routes, issues, deploys, alerts and MCP are being
                built in the open, and nothing is on npm yet.{" "}
                <a
                    href="https://github.com/omanshchoudhary/visor#readme"
                    className="text-fg underline decoration-line-strong underline-offset-[3px] hover:decoration-accent"
                >
                    Follow the progress
                </a>
                .
            </p>
        </div>
    );
}
