import { pino } from "pino";
import { pinoHttp } from "pino-http";

import { config } from "./config.ts";

export const logger = pino({
    level: config.NODE_ENV === "test" ? "silent" : "info",
    transport: config.NODE_ENV === "development" ? { target: "pino-pretty" } : undefined,
});

export const httpLogger = pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === "/health" },
    serializers: {
        req: (req: { method: string; url: string }) => ({
            method: req.method,
            path: req.url.split("?")[0],
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
    },
});
