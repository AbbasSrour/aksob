import { apiFetch } from "~/app/lib/api";

export type UserType = "student" | "alumni" | "faculty";

export interface EducationEntry {
	programId: string;
	name: string;
	graduationYear: number | null;
	isPrimary: boolean;
}

export interface ExperienceEntry {
	id: string;
	type: string;
	title: string;
	company: string;
	startDate: string | null;
	endDate: string | null;
	isCurrent: boolean;
}

export interface TagsData {
	skills: string[];
	goals: string[];
	hobbies: string[];
}

export interface LinkEntry {
	id: string;
	platform: string;
	url: string;
}

export interface ApiUser {
	id: string;
	name: string;
	email: string;
	type: UserType;
	majors: EducationEntry[];
	bio: string | null;
	company: string | null;
	title: string | null;
	image: string | null;
	createdAt: string;
	isVisibleInGalaxy: boolean;
	emailVisible: boolean;
	phoneNumberVisible: boolean;
	connectionTypes: string[];
	experience: ExperienceEntry[];
	tags: TagsData;
	links: LinkEntry[];
}

export async function listUsers() {
	return apiFetch<{ status: "ok"; data: ApiUser[] }>("/api/users");
}

export async function getCurrentUser() {
	return apiFetch<{ status: "ok"; data: ApiUser }>("/api/users/me");
}

export interface UpdateEducationParams {
	entries: Array<{
		programId: string;
		graduationYear?: number | null;
		isPrimary?: boolean;
	}>;
}

export async function updateEducation(params: UpdateEducationParams) {
	return apiFetch<{ status: string; data: EducationEntry[] }>(
		"/api/users/me/education",
		{ method: "PUT", body: JSON.stringify(params) },
	);
}

export interface UpdateExperienceParams {
	entries: Array<{
		type: string;
		title: string;
		company: string;
		startDate?: string | null;
		endDate?: string | null;
		isCurrent?: boolean;
	}>;
}

export async function updateExperience(params: UpdateExperienceParams) {
	return apiFetch<{ status: string; data: ExperienceEntry[] }>(
		"/api/users/me/experience",
		{ method: "PUT", body: JSON.stringify(params) },
	);
}

export interface UpdateTagsParams {
	skills: string[];
	goals: string[];
	hobbies: string[];
}

export async function updateTags(params: UpdateTagsParams) {
	return apiFetch<{ status: string }>("/api/users/me/tags", {
		method: "PUT",
		body: JSON.stringify(params),
	});
}

export interface UpdateLinksParams {
	entries: Array<{
		platform: string;
		url: string;
	}>;
}

export async function updateLinks(params: UpdateLinksParams) {
	return apiFetch<{ status: string; data: LinkEntry[] }>(
		"/api/users/me/links",
		{ method: "PUT", body: JSON.stringify(params) },
	);
}

// ── Connections ─────────────────────────────────

export interface ConnectionItem {
	id: string;
	requesterId: string;
	matchedUserId: string;
	type: string;
	status: "pending" | "active" | "declined" | "cancelled" | "completed";
	matchExplanation: string | null;
	createdAt: string;
	updatedAt: string;
}

export async function listConnections(status?: string, type?: string) {
	const params = new URLSearchParams();
	if (status) params.set("status", status);
	if (type) params.set("type", type);
	const qs = params.toString();
	return apiFetch<{ status: "ok"; data: ConnectionItem[] }>(
		`/api/connections${qs ? `?${qs}` : ""}`,
	);
}

export async function acceptConnection(id: string) {
	return apiFetch<{ status: "ok"; data: ConnectionItem }>(
		`/api/connections/${id}/accept`,
		{ method: "POST" },
	);
}

export async function declineConnection(id: string) {
	return apiFetch<{ status: "ok"; data: ConnectionItem }>(
		`/api/connections/${id}/decline`,
		{ method: "POST" },
	);
}

export async function cancelConnection(id: string) {
	return apiFetch<{ status: "ok"; data: ConnectionItem }>(
		`/api/connections/${id}/cancel`,
		{ method: "POST" },
	);
}

export async function completeConnection(id: string) {
	return apiFetch<{ status: "ok"; data: ConnectionItem }>(
		`/api/connections/${id}/complete`,
		{ method: "POST" },
	);
}

// ── Events ──────────────────────────────────────

export interface EventItem {
	id: string;
	title: string;
	description: string;
	coverImage: string | null;
	eventType: string;
	location: string | null;
	startDate: string;
	endDate: string;
	status: string;
	owner: { id: string; name: string; image: string | null } | null;
	createdAt: string;
	updatedAt: string;
}

export async function listMyEvents(filter: "upcoming" | "past" | "current") {
	return apiFetch<{ status: "ok"; data: EventItem[] }>(
		`/api/events?filter=${filter}`,
	);
}

// ── Stories ─────────────────────────────────────

export interface StoryItem {
	id: string;
	title: string;
	description: string;
	content: string;
	category: string;
	storyDate: string;
	status: "pending" | "approved" | "rejected";
	author: {
		id: string;
		name: string;
		image: string | null;
		program?: string | null;
	};
	reviewedBy: { id: string; name: string } | null;
	reviewNotes: string | null;
	reviewedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export async function listMyStories(userId: string) {
	return apiFetch<{ status: "ok"; data: StoryItem[] }>(
		`/api/stories?authorId=${encodeURIComponent(userId)}`,
	);
}

export interface CreateStoryParams {
	title: string;
	description: string;
	content: string;
	category: string;
	storyDate: string;
	coverImage?: string;
	thumbnailImage?: string;
}

export async function createStory(params: CreateStoryParams) {
	return apiFetch<{ status: "ok"; data: StoryItem }>("/api/stories", {
		method: "POST",
		body: JSON.stringify(params),
	});
}

export interface CreateEventParams {
	title: string;
	description: string;
	eventType: string;
	startDate: string;
	endDate: string;
	location?: string;
	meetingPlatform?: string;
	meetingUrl?: string;
	requiresRegistration?: boolean;
	registrationDeadline?: string;
	registrationMode?: string;
	capacity?: number;
	checkInEnabled?: boolean;
	remindersEnabled?: boolean;
	attendeeListVisible?: boolean;
}

export async function createEvent(params: CreateEventParams) {
	return apiFetch<{ status: "ok"; data: EventItem }>("/api/events", {
		method: "POST",
		body: JSON.stringify(params),
	});
}
