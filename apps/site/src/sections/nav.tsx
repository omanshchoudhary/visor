import { ArrowUpRight, Button, Label, Wordmark } from "@visorhq/ui";

const links = [
    ["How it works", "#how-it-works"],
    ["SDK", "#sdk"],
    ["Agents", "#agents"],
    ["Why", "#why"],
    ["Self-host", "#self-host"],
    ["Docs", "https://github.com/omanshchoudhary/visor#readme"],
];

export function Nav() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-line px-5 lg:px-10">
            <div className="flex items-center gap-4">
                <a href="#top" aria-label="Visor home">
                    <Wordmark />
                </a>
                <Label className="hidden border-l border-line pl-4 md:inline">
                    API monitoring for Node
                </Label>
            </div>
            <nav className="hidden gap-8 text-[13px] text-fg-2 lg:flex">
                {links.map(([text, href]) => (
                    <a key={text} href={href} className="hover:text-fg">
                        {text}
                    </a>
                ))}
            </nav>
            <div className="flex items-center gap-2.5">
                <Label className="hidden border border-line px-3 py-2 text-accent sm:inline">
                    Pre-release
                </Label>
                <Button
                    variant="secondary"
                    size="sm"
                    href="https://github.com/omanshchoudhary/visor"
                    icon={<ArrowUpRight />}
                >
                    GitHub
                </Button>
            </div>
        </header>
    );
}
