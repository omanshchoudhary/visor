import type { Request } from "express";

export const UNMATCHED_ROUTE = "unmatched";

export function routeTemplate(req: Request): string {
    const route = req.route as { path?: string } | undefined;

    if (route?.path === undefined) {
        return UNMATCHED_ROUTE;
    }

    // baseUrl carries live values, params maps them back to their names
    let base = req.baseUrl ?? "";
    for (const [name, value] of Object.entries(req.params ?? {})) {
        if (typeof value === "string" && value.length > 0) {
            base = base.replace(value, `:${name}`);
        }
    }

    const joined = `${base}${route.path}`.replace(/\/+/g, "/");

    return joined.length > 1 ? joined.replace(/\/$/, "") : joined;
}
