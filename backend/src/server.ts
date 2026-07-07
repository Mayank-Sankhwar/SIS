import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectPrisma, disconnectPrisma } from "./config/prisma.js";
import { logger } from "./config/logger.js";

async function bootstrap(): Promise<void> {
  await connectPrisma();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    logger.info(`${signal} received. Shutting down gracefully.`);

    server.close(async (error) => {
      if (error) {
        logger.error("Error while closing HTTP server", error);
        process.exit(1);
      }

      await disconnectPrisma();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrap().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
