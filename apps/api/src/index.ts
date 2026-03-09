import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";

app.listen(env.PORT, (server) => {
	logger.info(`🚀 AKSOB API is running at ${server?.hostname}:${server?.port}`);
	logger.info(
		`🏥 Health check: http://${server?.hostname}:${server?.port}/health`,
	);
	logger.info(
		`📖 OpenAPI spec: http://${server?.hostname}:${server?.port}/openapi`,
	);
	logger.info(`📚 Swagger UI: http://${server?.hostname}:${server?.port}/docs`);
});
