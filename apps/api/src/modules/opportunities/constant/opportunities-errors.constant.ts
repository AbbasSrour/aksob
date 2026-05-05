export const OPPORTUNITIES_ERRORS = {
	OPPORTUNITY_NOT_FOUND: {
		code: "OPPORTUNITY_NOT_FOUND",
		httpStatus: 404,
		message: "Opportunity not found",
	},
	NOT_AUTHOR: {
		code: "NOT_AUTHOR",
		httpStatus: 403,
		message: "Only the author can perform this action",
	},
	CANNOT_ASSIGN: {
		code: "CANNOT_ASSIGN",
		httpStatus: 403,
		message: "Only admins can assign opportunities to other users",
	},
} as const;

export type OpportunitiesErrorKey = keyof typeof OPPORTUNITIES_ERRORS;
export type OpportunitiesErrorDefinition =
	(typeof OPPORTUNITIES_ERRORS)[OpportunitiesErrorKey];
export type OpportunitiesErrorCode =
	(typeof OPPORTUNITIES_ERRORS)[OpportunitiesErrorKey]["code"];
