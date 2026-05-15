export const CONNECTION_STATUSES = [
	"pending",
	"active",
	"declined",
	"cancelled",
	"completed",
] as const;

export type ConnectionStatus = (typeof CONNECTION_STATUSES)[number];
