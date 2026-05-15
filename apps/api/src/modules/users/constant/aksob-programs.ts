export const AKSOB_PROGRAMS = [
	"BS in Business",
	"BS in Economics",
	"BS Hospitality Management",
	"MBA & Executive MBA",
	"MS Data Analytics",
	"MS Human Resources",
	"MA Applied Economics",
	"LLM & Master of Laws",
] as const;

export type AksobProgram = (typeof AKSOB_PROGRAMS)[number];
