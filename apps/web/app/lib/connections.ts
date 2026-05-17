import { apiFetch } from "~/app/lib/api";

export type ConnectionType =
	| "mentorship"
	| "career_coaching"
	| "study_partner"
	| "buddy"
	| "research"
	| "project";

export interface Connection {
	id: string;
	type: ConnectionType;
	requesterId: string;
	matchedUserId: string;
	status: "pending" | "active" | "declined" | "cancelled" | "completed";
	message: string | null;
	matchExplanation: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ConnectionCandidate {
	id: string;
	name: string;
	type: string;
	image: string | null;
}

export async function findConnectionMatch(input: {
	type: ConnectionType;
	message?: string;
}) {
	return apiFetch<{
		status: "ok";
		data: {
			candidates: ConnectionCandidate[];
			recommendedUserId: string | null;
			matchExplanation: string | null;
		};
	}>("/api/connections/match", {
		method: "POST",
		body: JSON.stringify(input),
	});
}

export async function sendConnectionRequest(input: {
	type: ConnectionType;
	matchedUserId: string;
	message?: string;
}) {
	return apiFetch<{ status: "ok"; data: Connection }>(
		"/api/connections/request",
		{
			method: "POST",
			body: JSON.stringify(input),
		},
	);
}
