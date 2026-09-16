import { useState } from "react";

import { cx } from "./cx.ts";

type CommandProps = {
    command: string;
    className?: string;
};

export function Command({ command, className }: CommandProps) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(command);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            setCopied(false);
        }
    }

    return (
        <div className={cx("flex border border-line-strong bg-bg", className)}>
            <div className="flex min-w-0 grow gap-2.5 px-[18px] py-4 text-sm text-fg">
                <span className="text-muted">$</span>
                <span className="truncate">{command}</span>
            </div>
            <button
                type="button"
                onClick={() => void copy()}
                className="label flex items-center border-l border-line-strong px-[18px] text-fg-2 hover:text-fg"
            >
                {copied ? "Copied" : "Copy"}
            </button>
        </div>
    );
}
