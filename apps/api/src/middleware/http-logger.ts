import { Elysia } from "elysia";
import { logger } from "@/utils/logger";

/**
 * Request logger middleware using Winston
 */
export const requestLogger = new Elysia({ name: "logger" })
	.derive(() => ({
		log: logger,
	}))
	.onRequest(({ request }) => {
		request.headers.set("x-start-time", Date.now().toString());
	})
	.onAfterResponse({ as: "global" }, ({ request, set }) => {
		const start = Number(request.headers.get("x-start-time"));
		const duration = Date.now() - start;
		const status = set.status ?? 200;
		const success = status >= 200 && status < 300;

		const color = success ? "\x1b[32m" : "\x1b[31m";
		const coloredStatus = `${color}${status}\x1b[39m`;

		if (success) {
			logger.info(`${request.method} ${request.url}`, {
				status: coloredStatus,
				duration: `${duration}ms`,
			});
		} else {
			logger.error(`${request.method} ${request.url}`, {
				status: coloredStatus,
				duration: `${duration}ms`,
			});
		}
	})
	.onError(({ error, request }) => {
		logger.error(`Error processing ${request.method} ${request.url}`, {
			error: error instanceof Error ? error.message : error,
		});
	});
