import { cx } from "./cx.ts";

type WordmarkProps = {
    size?: "sm" | "md" | "lg";
    className?: string;
};

const sizes = {
    sm: { square: "size-2.5", text: "text-base" },
    md: { square: "size-3", text: "text-[21px]" },
    lg: { square: "size-7", text: "text-7xl tracking-[-0.04em]" },
};

export function Wordmark({ size = "md", className }: WordmarkProps) {
    const s = sizes[size];
    return (
        <span className={cx("inline-flex items-center gap-2.5", className)}>
            <span className={cx("bg-accent", s.square)} />
            <span className={cx("font-display font-bold tracking-tight text-fg", s.text)}>
                visor
            </span>
        </span>
    );
}
