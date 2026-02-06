// noinspection HttpUrlsUsage

import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { env } from "./config/env";
import { requestLogger } from "./middleware/http-logger";
import { chatModule } from "./modules/chat/chat.routes";
import { healthModule } from "./modules/health/health.routes";
import { usersModule } from "./modules/users/users.routes";
import { authPlugin } from "./plugins/auth";
import { dbPlugin } from "./plugins/db";
import { logger } from "./utils/logger";

const app = new Elysia()
	.use(requestLogger)
	.use(
		cors({
			origin: [env.FRONTEND_URL, env.BETTER_AUTH_URL],
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			credentials: true,
			allowedHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.onBeforeHandle(async ({ request, set }) => {
		if (request.method !== "POST") {
			return;
		}

		const url = new URL(request.url);
		if (url.pathname !== "/api/auth/sign-up/email") {
			return;
		}

		try {
			const body = (await request.clone().json()) as {
				userType?: string;
				company?: string;
			};

			if (body.userType === "alumni" && !body.company?.trim()) {
				set.status = 400;
				return {
					error: "Company is required for alumni registrations",
				};
			}
		} catch {
			set.status = 400;
			return { error: "Invalid signup payload" };
		}
	})
	.use(
		openapi({
			path: "/openapi",
			documentation: {
				info: {
					title: "AKSOB API",
					version: "1.0.0",
				},
			},
		}),
	)
	.use(
		swagger({
			path: "/docs",
			documentation: {
				info: {
					title: "AKSOB API Documentation",
					version: "1.0.0",
				},
			},
		}),
	)
	.use(dbPlugin)
	.use(authPlugin)
	.use(healthModule)
	.use(chatModule)
	.use(usersModule)
	.onError(({ code, error, set }) => {
		if (code === "NOT_FOUND") {
			set.status = 404;
			return { error: "Route not found" };
		}

		logger.error("Server error", {
			error: error instanceof Error ? error.message : error,
		});
		set.status = 500;
		return { error: "Internal server error" };
	})
	.listen(env.PORT, (server) => {
		logger.info(
			`🚀 AKSOB API is running at ${server?.hostname}:${server?.port}`,
		);
		logger.info(
			`🏥 Health check: http://${server?.hostname}:${server?.port}/health`,
		);
		logger.info(
			`📖 OpenAPI spec: http://${server?.hostname}:${server?.port}/openapi`,
		);
		logger.info(
			`📚 Swagger UI: http://${server?.hostname}:${server?.port}/docs`,
		);
	});

export type App = typeof app;
