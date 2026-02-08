import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

export async function runMigrations() {
	const client = createClient({
		url: env.DATABASE_URL,
		authToken: env.TURSO_AUTH_TOKEN,
	});

	const db = drizzle(client);

	logger.info("Starting database migrations...");

	try {
		await migrate(db, {
			migrationsFolder: "./src/db/migrations",
		});
		logger.info("Database migrations completed successfully");
	} catch (error) {
		logger.error("Migration failed", {
			error: error instanceof Error ? error.message : error,
		});
		process.exit(1);
	} finally {
		client.close();
	}
}

if (import.meta.main) {
	runMigrations();
}
