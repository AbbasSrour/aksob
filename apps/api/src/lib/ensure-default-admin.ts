import { eq } from "drizzle-orm";
import { env } from "@/config/env";
import { db, schema } from "@/db";
import { logger } from "@/utils/logger";
import { auth } from "@/lib/auth";

const DEFAULT_ADMIN_EMAIL = "admin@aksob.lau.edu.lb";
const DEFAULT_ADMIN_NAME = "AKSOB Admin";

export const ensureDefaultAdmin = async () => {
	const existingAdmin = await db.query.user.findFirst({
		where: eq(schema.user.email, DEFAULT_ADMIN_EMAIL),
	});

	if (existingAdmin) {
		return;
	}

	await auth.api.signUpEmail({
		body: {
			name: DEFAULT_ADMIN_NAME,
			email: DEFAULT_ADMIN_EMAIL,
			password: env.DEFAULT_ADMIN_PASSWORD,
		},
	});

	await db
		.update(schema.user)
		.set({
			role: "admin",
			emailVerified: true,
		})
		.where(eq(schema.user.email, DEFAULT_ADMIN_EMAIL));

	logger.info("Created default admin user", {
		email: DEFAULT_ADMIN_EMAIL,
	});
};
