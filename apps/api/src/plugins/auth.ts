import { Elysia } from "elysia";
import { COMMON_ERRORS } from "@/constant/common-errors.constant";
import { auth } from "@/lib/auth";

/** Macro-only plugin for typed auth context.
 *
 *  Usage per route:
 *    { auth: true }        — require login, 401 if not. user = User.
 *    { auth: "optional" }  — no 401. user = User | null.
 *    { role: "admin" }     — 401+403. user = User with matching role.
 *                              (pairs with { auth: true } or standalone) */
export const authContext = new Elysia({ name: "auth-context" }).macro({
	auth: (enabled?: true | "optional") => ({
		async resolve({ status, request: { headers } }) {
			const session = await auth.api.getSession({
				headers,
			});

			if (enabled === true && !session) {
				return status(COMMON_ERRORS.NOT_AUTHENTICATED.httpStatus, {
					status: "error",
					code: COMMON_ERRORS.NOT_AUTHENTICATED.code,
					error: COMMON_ERRORS.NOT_AUTHENTICATED.message,
				});
			}

			return {
				user: session?.user ?? null,
				session: session?.session ?? null,
			};
		},
	}),
	role: (required: string | string[]) => ({
		async resolve({ user, status }) {
			if (!user) {
				return status(COMMON_ERRORS.NOT_AUTHENTICATED.httpStatus, {
					status: "error",
					code: COMMON_ERRORS.NOT_AUTHENTICATED.code,
					error: COMMON_ERRORS.NOT_AUTHENTICATED.message,
				});
			}

			const roles = Array.isArray(required) ? required : [required];
			if (!roles.includes(user.role)) {
				return status(COMMON_ERRORS.FORBIDDEN.httpStatus, {
					status: "error",
					code: COMMON_ERRORS.FORBIDDEN.code,
					error: COMMON_ERRORS.FORBIDDEN.message,
				});
			}
		},
	}),
});

/** Full auth plugin: mounts Better Auth handler only. Use once in app.ts. */
export const authPlugin = new Elysia({ name: "auth" }).mount(auth.handler);
