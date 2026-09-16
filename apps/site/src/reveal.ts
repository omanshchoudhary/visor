import type { CSSProperties } from "react";

let observer: IntersectionObserver | undefined;

function watch(node: HTMLElement | null) {
    if (!node) {
        return;
    }
    const io = (observer ??= new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    entry.target.setAttribute("data-shown", "");
                    io.unobserve(entry.target);
                }
            }
        },
        { rootMargin: "0px 0px -8% 0px" },
    ));
    io.observe(node);
    return () => io.unobserve(node);
}

export function reveal(index = 0, variant: "block" | "line" = "block") {
    return {
        ref: watch,
        "data-reveal": variant,
        style: { "--i": index } as CSSProperties,
    };
}
