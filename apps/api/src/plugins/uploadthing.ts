import { Elysia } from "elysia";
import { createRouteHandler } from "uploadthing/server";
import { env } from "@/config/env";
import { mediaRouter } from "@/lib/uploadthing";

let routeHandler: ReturnType<typeof createRouteHandler> | null = null;

const getRouteHandler = () => {
	if (!env.UPLOADTHING_TOKEN) {
		return null;
	}

	if (!routeHandler) {
		routeHandler = createRouteHandler({
			router: mediaRouter,
			config: {
				token: env.UPLOADTHING_TOKEN,
			},
		});
	}

	return routeHandler;
};

export const uploadthingPlugin = new Elysia({ name: "uploadthing" })
	.decorate("uploadthingRouter", mediaRouter)
	.get("/api/media", async ({ request, set }) => {
		const handler = getRouteHandler();

		if (!handler) {
			set.status = 500;
			return "UPLOADTHING_TOKEN is not configured";
		}

		return handler(request);
	})
	.post("/api/media", async ({ request, set }) => {
		const handler = getRouteHandler();

		if (!handler) {
			set.status = 500;
			return "UPLOADTHING_TOKEN is not configured";
		}

		return handler(request);
	});
