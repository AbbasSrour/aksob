export const MAJORS_ERRORS = {
	MAJOR_NOT_FOUND: {
		code: "MAJOR_NOT_FOUND",
		httpStatus: 404,
		message: "Major not found",
	},
	MAJOR_NAME_EXISTS: {
		code: "MAJOR_NAME_EXISTS",
		httpStatus: 409,
		message: "A major with this name already exists",
	},
	MAJOR_HAS_USERS: {
		code: "MAJOR_HAS_USERS",
		httpStatus: 403,
		message: "Cannot delete major that is assigned to users",
	},
} as const;

export type MajorsErrorKey = keyof typeof MAJORS_ERRORS;
export type MajorsErrorDefinition = (typeof MAJORS_ERRORS)[MajorsErrorKey];
export type MajorsErrorCode = (typeof MAJORS_ERRORS)[MajorsErrorKey]["code"];
