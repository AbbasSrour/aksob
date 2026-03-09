import { AKSOB_MAJORS } from "@aksob/shared";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, phoneNumber } from "better-auth/plugins";
import { env } from "@/config/env";
import { db } from "@/db";

const normalizeOrigin = (value: string): string | null => {
	try {
		return new URL(value).origin;
	} catch {
		return null;
	}
};

const trustedOrigins = [
	env.FRONTEND_URL,
	env.BETTER_AUTH_URL,
	...(env.CORS_ORIGINS?.split(",") ?? []),
]
	.map((origin) => normalizeOrigin(origin.trim()))
	.filter((origin): origin is string => Boolean(origin));

const isSecureAuth = env.BETTER_AUTH_URL.startsWith("https://");

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	emailVerification: {
		sendOnSignUp: false,
		sendOnSignIn: false,
	},
	user: {
		additionalFields: {
			userType: {
				type: "string",
				required: false,
				defaultValue: "student",
			},
			major: {
				type: "string",
				required: false,
				defaultValue: AKSOB_MAJORS[0],
			},
			company: {
				type: "string",
				required: false,
			},
			title: {
				type: "string",
				required: false,
			},
		},
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins,
	advanced: {
		defaultCookieAttributes: {
			sameSite: isSecureAuth ? "none" : "lax",
			secure: isSecureAuth,
		},
	},
	plugins: [admin(), phoneNumber()],
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (ctx.path !== "/sign-up/email") {
				return;
			}
			const body = ctx.body as { userType?: string; company?: string };
			if (body.userType === "alumni" && !body.company?.trim()) {
				throw new APIError("BAD_REQUEST", {
					message: "Company is required for alumni registrations",
				});
			}
		}),
	},
});

export type Auth = typeof auth;
