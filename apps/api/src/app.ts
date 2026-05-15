// noinspection HttpUrlsUsage

import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { env } from "@/config/env";
import { requestLogger } from "@/middleware/http-logger";
import { chatModule } from "@/modules/chat/chat.routes";
import { connectionsModule } from "@/modules/connections/connections.routes";
import { eventsModule } from "@/modules/events/events.routes";
import { healthModule } from "@/modules/health/health.routes";
import { programsModule } from "@/modules/programs/programs.routes";
import { newsModule } from "@/modules/news/news.routes";
import { newsCategoriesModule } from "@/modules/news/news-categories.routes";
import { opportunitiesModule } from "@/modules/opportunities/opportunities.routes";
import { researchModule } from "@/modules/research/research.routes";
import { statsModule } from "@/modules/stats/stats.routes";
import { storiesModule } from "@/modules/stories/stories.routes";
import { usersModule } from "@/modules/users/users.routes";
import { authPlugin } from "@/plugins/auth";
import { dbPlugin } from "@/plugins/db";
import { uploadthingPlugin } from "@/plugins/uploadthing";
import { logger } from "@/utils/logger";

export const app = new Elysia()
	.use(requestLogger)
	.use(
		cors({
			origin: env.trustedOrigins,
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
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
	.use(uploadthingPlugin)
	.use(statsModule)
	.use(healthModule)
	.use(programsModule)
	.use(newsCategoriesModule)
	.use(newsModule)
	.use(eventsModule)
	.use(opportunitiesModule)
	.use(researchModule)
	.use(storiesModule)
	.use(chatModule)
	.use(connectionsModule)
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
	});

export type App = typeof app;
