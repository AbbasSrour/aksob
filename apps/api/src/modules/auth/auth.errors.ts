export const AUTH_ERRORS = {
	ALUMNI_COMPANY_REQUIRED: {
		code: "ALUMNI_COMPANY_REQUIRED",
		httpStatus: 400,
		message: "Company is required for alumni registrations",
	},
	USER_EMAIL_ALREADY_EXISTS: {
		code: "USER_EMAIL_ALREADY_EXISTS",
		httpStatus: 409,
		message: "User already exists. Use another email.",
	},
	USER_PHONE_NUMBER_ALREADY_EXISTS: {
		code: "USER_PHONE_NUMBER_ALREADY_EXISTS",
		httpStatus: 409,
		message: "Phone number already exists.",
	},
} as const;

export type AuthErrorKey = keyof typeof AUTH_ERRORS;
export type AuthErrorDefinition = (typeof AUTH_ERRORS)[AuthErrorKey];
export type AuthErrorCode = (typeof AUTH_ERRORS)[AuthErrorKey]["code"];
export type AuthErrorHttpStatus =
	(typeof AUTH_ERRORS)[AuthErrorKey]["httpStatus"];
