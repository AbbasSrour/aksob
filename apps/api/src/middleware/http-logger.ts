import { Elysia } from "elysia";
import { logger } from "@/utils/logger";

/**
 * Request logger middleware using Winston
 */

const methodColors: Record<string, string> = {
	GET: "\x1b[36m",
	POST: "\x1b[32m",
	PUT: "\x1b[33m",
	PATCH: "\x1b[35m",
	DELETE: "\x1b[31m",
	OPTIONS: "\x1b[90m",
	HEAD: "\x1b[90m",
};

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
		const status = Number(set.status ?? 200);
		const statusColor =
			status >= 500
				? "\x1b[31m"
				: status >= 400
					? "\x1b[33m"
					: status >= 300
						? "\x1b[36m"
						: "\x1b[32m";

		const method = request.method.padEnd(7);
		const methodColor = methodColors[request.method] ?? "\x1b[37m";
		const msg = `${methodColor}${method}\x1b[39m ${statusColor}${status}\x1b[39m ${statusColor}${duration}\x1b[39mms ${request.url}`;

		if (status >= 400) {
			logger.error(msg);
		} else {
			logger.info(msg);
		}
	})
	.onError(({ error, request }) => {
		logger.error(`Error processing ${request.method} ${request.url}`, {
			error: error instanceof Error ? error.message : error,
		});
	});
