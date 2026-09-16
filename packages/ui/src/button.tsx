import type { ReactNode } from "react";

import { cx } from "./cx.ts";

type ButtonProps = {
    variant?: "primary" | "secondary";
    size?: "md" | "sm";
    href?: string;
    icon?: ReactNode;
    children: ReactNode;
    className?: string;
};

const variants = {
    primary: "bg-accent text-accent-fg font-semibold",
    secondary: "border border-line-strong text-fg",
};

const sizes = {
    md: "gap-2.5 px-[22px] py-[15px] text-sm",
    sm: "gap-2 px-3.5 py-2 text-[13px]",
};

export function Button({
    variant = "primary",
    size = "md",
    href,
    icon,
    children,
    className,
}: ButtonProps) {
    const cls = cx(
        "inline-flex items-center whitespace-nowrap",
        variants[variant],
        sizes[size],
        className,
    );
    if (href) {
        return (
            <a href={href} className={cls}>
                {children}
                {icon}
            </a>
        );
    }
    return (
        <button type="button" className={cls}>
            {children}
            {icon}
        </button>
    );
}
