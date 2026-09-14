import express, { type Express } from "express";

import { healthHandler } from "./routes/health.ts";
const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

app.get("/health", healthHandler);

app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`Server is running on port ${PORT}`);
});
