export const AKSOB_MAJORS = [
	"BS in Business",
	"BS in Economics",
	"BS Hospitality Management",
	"MBA & Executive MBA",
	"MS Data Analytics",
	"MS Human Resources",
	"MA Applied Economics",
	"LLM & Master of Laws",
] as const;

export type AksobMajor = (typeof AKSOB_MAJORS)[number];
