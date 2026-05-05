export const RESEARCH_ERRORS = {
	RESEARCH_NOT_FOUND: {
		code: "RESEARCH_NOT_FOUND",
		httpStatus: 404,
		message: "Research program not found",
	},
	NOT_AUTHOR: {
		code: "NOT_AUTHOR",
		httpStatus: 403,
		message: "Only the author can perform this action",
	},
} as const;

export type ResearchErrorKey = keyof typeof RESEARCH_ERRORS;
export type ResearchErrorDefinition =
	(typeof RESEARCH_ERRORS)[ResearchErrorKey];
export type ResearchErrorCode =
	(typeof RESEARCH_ERRORS)[ResearchErrorKey]["code"];
