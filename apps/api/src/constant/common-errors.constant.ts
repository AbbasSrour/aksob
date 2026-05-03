export const COMMON_ERRORS = {
	NOT_AUTHENTICATED: {
		code: "NOT_AUTHENTICATED",
		httpStatus: 401,
		message: "Not authenticated",
	},
	FORBIDDEN: {
		code: "FORBIDDEN",
		httpStatus: 403,
		message: "Forbidden",
	},
	NOT_FOUND: {
		code: "NOT_FOUND",
		httpStatus: 404,
		message: "Resource not found",
	},
} as const;

export type CommonErrorKey = keyof typeof COMMON_ERRORS;
export type CommonErrorDefinition = (typeof COMMON_ERRORS)[CommonErrorKey];
export type CommonErrorCode = (typeof COMMON_ERRORS)[CommonErrorKey]["code"];
