export const USER_ERRORS = {
	USER_NOT_FOUND: {
		code: "USER_NOT_FOUND",
		httpStatus: 404,
		message: "User not found",
	},
} as const;

export type UserErrorKey = keyof typeof USER_ERRORS;
export type UserErrorDefinition = (typeof USER_ERRORS)[UserErrorKey];
export type UserErrorCode = (typeof USER_ERRORS)[UserErrorKey]["code"];
