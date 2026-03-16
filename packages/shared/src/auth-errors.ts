import { AUTH_ERRORS } from "../../../apps/api/src/modules/auth/auth.errors";

const createErrorFieldMap = <
	TErrors extends Record<string, Record<string, unknown>>,
	TField extends keyof TErrors[keyof TErrors],
>(errors: TErrors, field: TField) =>
	Object.fromEntries(
		Object.entries(errors).map(([key, value]) => [key, value[field]]),
	) as {
		[K in keyof TErrors]: TErrors[K][TField];
	};

export const AUTH_ERROR_CODES = createErrorFieldMap(AUTH_ERRORS, "code");

export type AuthErrorCode =
	(typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
