export const CONNECTION_TYPES = [
	"mentorship",
	"career_coaching",
	"study_partner",
	"buddy",
	"research",
	"project",
] as const;

export type ConnectionType = (typeof CONNECTION_TYPES)[number];
