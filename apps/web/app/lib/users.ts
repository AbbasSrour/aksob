import type { AksobProgram } from "@aksob/sdk";
import { apiFetch } from "~/app/lib/api";

export type UserType = "student" | "alumni" | "faculty";

export interface ApiUser {
	id: string;
	name: string;
	email: string;
	type: UserType;
	program: AksobProgram;
	bio: string | null;
	company: string | null;
	title: string | null;
	image: string | null;
	createdAt: string;
}

export async function listUsers() {
	return apiFetch<{ status: "ok"; data: ApiUser[] }>("/users");
}

export async function getCurrentUser() {
	return apiFetch<{ status: "ok"; data: ApiUser }>("/users/me");
}
