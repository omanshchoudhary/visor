import { app } from "./app.ts";
import { config } from "./config.ts";
import { logger } from "./logger.ts";

const PORT = config.PORT;

app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    logger.info(`Server is running on port ${PORT}`);
});
