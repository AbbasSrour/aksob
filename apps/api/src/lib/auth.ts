import { AKSOB_MAJORS } from "@aksob/shared";
import {
	generateEmailVerificationEmail,
	generatePasswordResetEmail,
} from "@aksob/templates";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { admin, phoneNumber } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { env } from "@/config/env";
import { db, schema } from "@/db";
import { sendEmail } from "@/lib/email";
import { AUTH_ERRORS } from "@/modules/auth/auth.errors";
import { logger } from "@/utils/logger";

const isSecureAuth = env.BETTER_AUTH_URL.startsWith("https://");

interface UniqueUserFieldsInput {
	email?: string;
	phoneNumber?: string;
	excludeUserId?: string;
}

const ensureUniqueUserFields = async ({
	email,
	phoneNumber,
	excludeUserId,
}: UniqueUserFieldsInput) => {
	const normalizedEmail = email?.trim().toLowerCase();
	const normalizedPhoneNumber = phoneNumber?.trim();

	if (normalizedEmail) {
		const existingUser = await db.query.user.findFirst({
			columns: { id: true },
			where: eq(schema.user.email, normalizedEmail),
		});

		if (existingUser && existingUser.id !== excludeUserId) {
			throw new APIError(
				AUTH_ERRORS.USER_EMAIL_ALREADY_EXISTS.httpStatus,
				AUTH_ERRORS.USER_EMAIL_ALREADY_EXISTS,
			);
		}
	}

	if (normalizedPhoneNumber) {
		const existingUser = await db.query.user.findFirst({
			columns: { id: true },
			where: eq(schema.user.phoneNumber, normalizedPhoneNumber),
		});

		if (existingUser && existingUser.id !== excludeUserId) {
			throw new APIError(
				AUTH_ERRORS.USER_PHONE_NUMBER_ALREADY_EXISTS.httpStatus,
				AUTH_ERRORS.USER_PHONE_NUMBER_ALREADY_EXISTS,
			);
		}
	}
};

interface CreateUserBody {
	email?: string;
	data?: {
		phoneNumber?: string;
	};
}

interface UpdateUserBody {
	userId?: string;
	data?: {
		email?: string;
		phoneNumber?: string;
	};
}

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: env.trustedOrigins,
	database: drizzleAdapter(db, {
		provider: "sqlite",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		sendResetPassword: async ({ user, url }) => {
			void (async () => {
				const message = await generatePasswordResetEmail({
					name: user.name,
					resetUrl: url,
				});

				await sendEmail({
					to: user.email,
					...message,
				});
			})().catch((error) => {
				logger.error("Failed to send password reset email", { error });
			});
		},
	},
	emailVerification: {
		sendOnSignUp: false,
		sendOnSignIn: false,
		sendVerificationEmail: async ({ user, url }) => {
			void (async () => {
				const message = await generateEmailVerificationEmail({
					name: user.name,
					verificationUrl: url,
				});

				await sendEmail({
					to: user.email,
					...message,
				});
			})().catch((error) => {
				logger.error("Failed to send verification email", { error });
			});
		},
	},
	user: {
		changeEmail: {
			enabled: true,
		},
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
	advanced: {
		defaultCookieAttributes: {
			sameSite: isSecureAuth ? "none" : "lax",
			secure: isSecureAuth,
		},
	},
	plugins: [admin(), phoneNumber()],
	hooks: {
		before: createAuthMiddleware(async (ctx) => {
			if (ctx.path === "/admin/create-user") {
				const body = ctx.body as CreateUserBody;

				await ensureUniqueUserFields({
					email: body.email,
					phoneNumber: body.data?.phoneNumber,
				});

				return;
			}

			if (ctx.path === "/admin/update-user") {
				const body = ctx.body as UpdateUserBody;

				await ensureUniqueUserFields({
					email: body.data?.email,
					phoneNumber: body.data?.phoneNumber,
					excludeUserId: body.userId,
				});

				return;
			}

			if (ctx.path !== "/sign-up/email") {
				return;
			}

			const body = ctx.body as { userType?: string; company?: string };

			if (body.userType === "alumni" && !body.company?.trim()) {
				throw new APIError(
					AUTH_ERRORS.ALUMNI_COMPANY_REQUIRED.httpStatus,
					AUTH_ERRORS.ALUMNI_COMPANY_REQUIRED,
				);
			}
		}),
	},
});

export type Auth = typeof auth;
