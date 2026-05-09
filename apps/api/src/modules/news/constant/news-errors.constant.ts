export const NEWS_ERRORS = {
	NEWS_NOT_FOUND: {
		code: "NEWS_NOT_FOUND",
		httpStatus: 404,
		message: "News article not found",
	},
	NEWS_CATEGORY_NOT_FOUND: {
		code: "NEWS_CATEGORY_NOT_FOUND",
		httpStatus: 404,
		message: "News category not found",
	},
	NEWS_CATEGORY_ALREADY_EXISTS: {
		code: "NEWS_CATEGORY_ALREADY_EXISTS",
		httpStatus: 409,
		message: "A news category with that name already exists",
	},
} as const;
