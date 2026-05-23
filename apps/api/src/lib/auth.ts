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
import { generateAndStoreEmbedding } from "@/lib/ai/embedding";
import { sendEmail } from "@/lib/email";
import { AUTH_ERRORS } from "@/modules/auth/auth.errors";
import { CONNECTION_TYPE_ELIGIBILITY } from "@/modules/connections/constant/connection-eligibility.constant";
import { CONNECTION_TYPES } from "@/modules/connections/constant/connection-types.constant";
import type { UserType } from "@/modules/users/constant/user-types";
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
			type: {
				type: "string",
				required: false,
				defaultValue: "student",
			},
			bio: {
				type: "string",
				required: false,
			},
			onboarding: {
				type: "string",
				required: false,
				defaultValue: "welcome",
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
		}),
		after: createAuthMiddleware(async (ctx) => {
			if (ctx.path !== "/update-user") {
				return;
			}

			const body = ctx.body as {
				isVisibleInGalaxy?: boolean;
				emailVisible?: boolean;
				phoneNumberVisible?: boolean;
				connectionTypes?: string[];
				onboarding?: string;
			};

			const userId = ctx.context.user?.id;
			if (!userId) return;

			const userType = (ctx.context.user?.type ?? "student") as UserType;

			// ── Visibility gate ──────────────────────────
			const exposureFlags = [body.emailVisible, body.phoneNumberVisible].some(
				(f) => f === true,
			);
			const hasConnectionTypes =
				body.connectionTypes !== undefined && body.connectionTypes.length > 0;

			if (
				body.isVisibleInGalaxy === false &&
				(exposureFlags || hasConnectionTypes)
			) {
				throw new APIError("BAD_REQUEST", {
					code: "VISIBILITY_GATE",
					message:
						"Cannot set exposure flags or connection preferences while isVisibleInGalaxy is off",
				});
			}

			// ── Update settings ─────────────────────────
			if (
				body.isVisibleInGalaxy !== undefined ||
				body.emailVisible !== undefined ||
				body.phoneNumberVisible !== undefined
			) {
				const sets: Record<string, unknown> = {};

				if (body.isVisibleInGalaxy !== undefined) {
					sets.isVisibleInGalaxy = body.isVisibleInGalaxy;
				}
				if (body.emailVisible !== undefined) {
					sets.emailVisible = body.emailVisible;
				}
				if (body.phoneNumberVisible !== undefined) {
					sets.phoneNumberVisible = body.phoneNumberVisible;
				}

				await db
					.insert(schema.userSettings)
					.values({ userId, ...sets })
					.onConflictDoUpdate({
						target: schema.userSettings.userId,
						set: sets,
					});
			}

			// ── Visibility off → clear exposure + prefs ─
			if (body.isVisibleInGalaxy === false) {
				await db
					.update(schema.userSettings)
					.set({
						emailVisible: false,
						phoneNumberVisible: false,
					})
					.where(eq(schema.userSettings.userId, userId));

				await db
					.delete(schema.userConnectionPreference)
					.where(eq(schema.userConnectionPreference.userId, userId));
			}

			// ── Update connection preferences ───────────
			if (body.connectionTypes !== undefined) {
				const eligibleTypes = CONNECTION_TYPE_ELIGIBILITY[userType];

				for (const ct of body.connectionTypes) {
					if (
						!CONNECTION_TYPES.includes(ct as (typeof CONNECTION_TYPES)[number])
					) {
						throw new APIError("BAD_REQUEST", {
							code: "INVALID_CONNECTION_TYPE",
							message: `Invalid connection type: ${ct}`,
						});
					}
					if (
						!eligibleTypes.includes(ct as (typeof CONNECTION_TYPES)[number])
					) {
						throw new APIError("BAD_REQUEST", {
							code: "CONNECTION_TYPE_NOT_ELIGIBLE",
							message: `Not eligible for connection type: ${ct}`,
						});
					}
				}

				await db
					.delete(schema.userConnectionPreference)
					.where(eq(schema.userConnectionPreference.userId, userId));

				if (body.connectionTypes.length > 0) {
					await db.insert(schema.userConnectionPreference).values(
						body.connectionTypes.map((ct) => ({
							userId,
							type: ct as (typeof CONNECTION_TYPES)[number],
						})),
					);
				}
			}

			// ── Onboarding completed → generate embedding ─
			if (body.onboarding === "complete") {
				await generateAndStoreEmbedding(userId);
			}
		}),
	},
});

export type Auth = typeof auth;
