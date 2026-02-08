import { logger } from "@/utils/logger";
import { runMigrations } from "./migrate";
import { seedDemoUsers } from "./seed-demo-users";

const runDatabaseSetup = async () => {
	logger.info("Running database setup");

	await runMigrations();
	await seedDemoUsers();

	logger.info("Database setup completed");
};

runDatabaseSetup().catch((error) => {
	logger.error("Database setup failed", {
		error: error instanceof Error ? error.message : error,
	});
	process.exit(1);
});
