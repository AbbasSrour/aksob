export const STORIES_ERRORS = {
	STORY_NOT_FOUND: {
		code: "STORY_NOT_FOUND",
		httpStatus: 404,
		message: "Story not found",
	},
	NOT_AUTHOR: {
		code: "NOT_AUTHOR",
		httpStatus: 403,
		message: "Only the author can perform this action",
	},
	CANNOT_ASSIGN: {
		code: "CANNOT_ASSIGN",
		httpStatus: 403,
		message: "Only admins can assign stories to other users",
	},
} as const;

export type StoriesErrorKey = keyof typeof STORIES_ERRORS;
export type StoriesErrorDefinition = (typeof STORIES_ERRORS)[StoriesErrorKey];
export type StoriesErrorCode = (typeof STORIES_ERRORS)[StoriesErrorKey]["code"];
