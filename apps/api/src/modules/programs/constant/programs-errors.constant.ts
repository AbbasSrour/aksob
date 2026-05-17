export const PROGRAMS_ERRORS = {
	PROGRAM_NOT_FOUND: {
		code: "PROGRAM_NOT_FOUND",
		httpStatus: 404,
		message: "Program not found",
	},
	PROGRAM_NAME_EXISTS: {
		code: "PROGRAM_NAME_EXISTS",
		httpStatus: 409,
		message: "A program with this name already exists",
	},
} as const;

export type ProgramsErrorKey = keyof typeof PROGRAMS_ERRORS;
export type ProgramsErrorDefinition =
	(typeof PROGRAMS_ERRORS)[ProgramsErrorKey];
export type ProgramsErrorCode =
	(typeof PROGRAMS_ERRORS)[ProgramsErrorKey]["code"];
