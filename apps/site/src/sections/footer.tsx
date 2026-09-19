import { Label, Wordmark } from "@visorhq/ui";

const links = [
    ["GitHub", "https://github.com/omanshchoudhary/visor"],
    ["npm", "https://www.npmjs.com/org/visorhq"],
    ["Docs", "https://github.com/omanshchoudhary/visor#readme"],
    ["Security", "https://github.com/omanshchoudhary/visor/security/policy"],
    ["Changelog", "https://github.com/omanshchoudhary/visor/releases"],
];

export function Footer() {
    return (
        <footer className="flex flex-col gap-6 px-6 pt-8 pb-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2.5">
                <Wordmark size="sm" />
                <span className="text-xs text-muted">
                    Open-source API monitoring for Node and Express · MIT
                </span>
            </div>
            <nav className="flex flex-wrap gap-7">
                {links.map(([text, href]) => (
                    <a key={text} href={href}>
                        <Label className="text-fg-2 hover:text-fg">{text}</Label>
                    </a>
                ))}
            </nav>
        </footer>
    );
}
