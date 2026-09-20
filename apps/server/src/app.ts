import cookieParser from "cookie-parser";
import express, { type Express } from "express";

import { httpLogger } from "./logger.ts";
import { errorHandler, notFound } from "./middleware/error-handler.ts";
import { healthHandler } from "./routes/health.ts";

export const app: Express = express();

app.disable("x-powered-by");
app.use(httpLogger);
app.use(express.json());
app.use(cookieParser());

app.get("/health", healthHandler);

app.use(notFound);
app.use(errorHandler);
