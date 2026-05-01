import { Elysia } from "elysia";
import { auth } from "@/lib/auth";

/** Macro-only plugin for typed auth context.
 *  Use this in route modules that need { auth: true } or { admin: true }. */
export const authContext = new Elysia({ name: "auth-context" })
	.macro({
		auth: {
			async resolve({ status, request: { headers } }) {
				const session = await auth.api.getSession({
					headers,
				});

				if (!session) return status(401);

				return {
					user: session.user,
					session: session.session,
				};
			},
		},
		admin: {
			async resolve({ status, request: { headers } }) {
				const session = await auth.api.getSession({
					headers,
				});

				if (!session) return status(401);

				if (session.user.role !== "admin") return status(403);

				return {
					user: session.user,
					session: session.session,
				};
			},
		},
	});

/** Full auth plugin: mounts Better Auth handler only. Use once in app.ts. */
export const authPlugin = new Elysia({ name: "auth" })
	.mount(auth.handler);
