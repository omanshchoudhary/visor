import cookieParser from "cookie-parser";
import express, { type Express } from "express";

import { config } from "./config.ts";
import { httpLogger, logger } from "./logger.ts";
import { errorHandler, notFound } from "./middleware/error-handler.ts";
import { healthHandler } from "./routes/health.ts";
const app: Express = express();
const PORT = config.PORT;

app.disable("x-powered-by");
app.use(httpLogger);
app.use(express.json());
app.use(cookieParser());

app.get("/health", healthHandler);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    logger.info(`Server is running on port ${PORT}`);
});
