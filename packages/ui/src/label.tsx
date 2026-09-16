import type { ComponentPropsWithoutRef } from "react";

import { cx } from "./cx.ts";

export function Label({ className, ...props }: ComponentPropsWithoutRef<"span">) {
    return <span className={cx("label", className)} {...props} />;
}
