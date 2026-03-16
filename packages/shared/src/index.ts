export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat("en-US", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

export * from "./auth-errors";

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
	if (text.length <= length) return text;
	return `${text.slice(0, length).trim()}...`;
}

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
