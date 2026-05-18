import { app } from "@/app";
import { env } from "@/config/env";
import { ensureDefaultAdmin } from "@/lib/ensure-default-admin";
import { logger } from "@/utils/logger";

const maskDatabaseUrl = (databaseUrl: string) => {
	if (databaseUrl.startsWith("file:")) {
		return databaseUrl;
	}

	const url = new URL(databaseUrl);
	return `${url.protocol}//${url.hostname}`;
};

try {
	await ensureDefaultAdmin();
} catch (error) {
	logger.error("Failed to initialize default admin", {
		databaseUrl: maskDatabaseUrl(env.DATABASE_URL),
		error: error instanceof Error ? error.message : error,
	});
	process.exit(1);
}

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
