import { Elysia } from "elysia";

export const healthModule = new Elysia({ prefix: "/health" }).get("/", () => ({
	status: "healthy",
	timestamp: new Date().toISOString(),
}));
