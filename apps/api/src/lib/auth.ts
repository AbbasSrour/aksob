import { AKSOB_MAJORS } from "@aksob/shared";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, phoneNumber } from "better-auth/plugins";
import { env } from "@/config/env";
import { db } from "@/db";

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
	trustedOrigins: [env.FRONTEND_URL, env.BETTER_AUTH_URL],
	plugins: [admin(), phoneNumber()],
});

export type Auth = typeof auth;
