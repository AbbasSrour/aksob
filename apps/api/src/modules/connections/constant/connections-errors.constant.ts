export const CONNECTION_ERRORS = {
	CONNECTION_NOT_FOUND: {
		code: "CONNECTION_NOT_FOUND",
		httpStatus: 404,
		message: "Connection not found",
	},
	INVALID_CONNECTION_TYPE: {
		code: "INVALID_CONNECTION_TYPE",
		httpStatus: 400,
		message: "Invalid connection type",
	},
	CONNECTION_TYPE_NOT_ELIGIBLE: {
		code: "CONNECTION_TYPE_NOT_ELIGIBLE",
		httpStatus: 400,
		message: "You are not eligible for this connection type",
	},
	RATE_LIMIT_REACHED: {
		code: "RATE_LIMIT_REACHED",
		httpStatus: 429,
		message:
			"You have sent the maximum of 50 connection requests today. Please try again tomorrow.",
	},
	ALREADY_MATCHED: {
		code: "ALREADY_MATCHED",
		httpStatus: 409,
		message:
			"You already have a pending or active connection with this user for this type",
	},
	CANNOT_MATCH_SELF: {
		code: "CANNOT_MATCH_SELF",
		httpStatus: 400,
		message: "You cannot match with yourself",
	},
	NOT_MATCHED_USER: {
		code: "NOT_MATCHED_USER",
		httpStatus: 403,
		message: "Only the matched user can accept or decline",
	},
	NOT_PENDING: {
		code: "NOT_PENDING",
		httpStatus: 400,
		message: "Connection is not in pending status",
	},
	NOT_ACTIVE: {
		code: "NOT_ACTIVE",
		httpStatus: 400,
		message: "Connection is not active",
	},
	CANNOT_CANCEL_PENDING: {
		code: "CANNOT_CANCEL_PENDING",
		httpStatus: 403,
		message: "Only the requester can cancel a pending connection request",
	},
	NOT_PARTICIPANT: {
		code: "NOT_PARTICIPANT",
		httpStatus: 403,
		message: "You are not a participant in this connection",
	},
	VISIBILITY_GATE: {
		code: "VISIBILITY_GATE",
		httpStatus: 400,
		message:
			"Connection preferences cannot be set while isVisibleInGalaxy is off",
	},
	NO_MATCH_FOUND: {
		code: "NO_MATCH_FOUND",
		httpStatus: 404,
		message: "No matching user found for this connection type",
	},
} as const;
