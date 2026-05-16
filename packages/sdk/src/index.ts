import type { App } from "@aksob/api/app";
import type { Treaty } from "@elysiajs/eden";
import { treaty } from "@elysiajs/eden";

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

export type { App } from "@aksob/api/app";

export interface Connection {
	id: string;
	type: string;
	requesterId: string;
	matchedUserId: string;
	status: "pending" | "active" | "declined" | "cancelled" | "completed";
	message: string | null;
	matchExplanation: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export function createApiClient(
	baseUrl: string,
	options?: Treaty.Config,
): Treaty.Create<App> {
	return treaty<App>(baseUrl, {
		...options,
		fetch: {
			credentials: "include",
			...(options?.fetch ?? {}),
		},
	});
}

export function getApiErrorMessage(error: unknown) {
	if (typeof error === "string") {
		return error;
	}

	if (error && typeof error === "object") {
		if ("error" in error && typeof error.error === "string") {
			return error.error;
		}

		if ("message" in error && typeof error.message === "string") {
			return error.message;
		}

		if ("summary" in error && typeof error.summary === "string") {
			return error.summary;
		}
	}

	return "Request failed";
}
