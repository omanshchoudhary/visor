import { NavLink, Outlet } from "react-router";

import { Label, Wordmark } from "@visorhq/ui";

const links = [
    { text: "Overview", to: "/" },
    { text: "Routes", to: "/routes" },
];

export function AppLayout() {
    return (
        <div className="min-h-screen bg-bg text-fg">
            <header className="flex h-16 items-center justify-between border-b border-line px-5 lg:px-10">
                <div className="flex items-center gap-4">
                    <NavLink to="/" aria-label="Visor home">
                        <Wordmark />
                    </NavLink>
                    <Label className="hidden border-l border-line pl-4 md:inline">Dashboard</Label>
                </div>
                <nav className="flex gap-8 text-[13px] text-fg-2">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end
                            className={({ isActive }) => (isActive ? "text-fg" : "hover:text-fg")}
                        >
                            {link.text}
                        </NavLink>
                    ))}
                </nav>
            </header>
            <main className="px-5 py-8 lg:px-10">
                <Outlet />
            </main>
        </div>
    );
}
