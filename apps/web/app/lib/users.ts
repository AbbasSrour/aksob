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
	email: string | null;
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

export interface UpdateSettingsParams {
	isVisibleInGalaxy?: boolean;
	emailVisible?: boolean;
	phoneNumberVisible?: boolean;
	connectionTypes?: string[];
}

export async function updateSettings(params: UpdateSettingsParams) {
	return apiFetch<{ status: string }>("/api/users/me/settings", {
		method: "PUT",
		body: JSON.stringify(params),
	});
}

// ── Connections ─────────────────────────────────

export interface ConnectionItem {
	id: string;
	requesterId: string;
	matchedUserId: string;
	requester: {
		id: string;
		name: string;
		image: string | null;
		type: string;
	} | null;
	matchedUser: {
		id: string;
		name: string;
		image: string | null;
		type: string;
	} | null;
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
	registrationDeadline: string | null;
	requiresRegistration: boolean;
	capacity: number | null;
	registrationClosed: boolean;
	status: string;
	checkInEnabled: boolean;
	remindersEnabled: boolean;
	attendeeListVisible: boolean;
	owner: { id: string; name: string; image: string | null } | null;
	viewerRegistration: {
		role: "owner" | "organizer" | "attendee";
		attendeeStatus:
			| "approved"
			| "pending"
			| "waitlisted"
			| "cancelled"
			| "rejected"
			| null;
	} | null;
	createdAt: string;
	updatedAt: string;
}

export interface AdminEventItem extends EventItem {
	meetingPlatform: string | null;
	meetingUrl: string | null;
	registrationMode: "open" | "approval";
	registrationClosedAt: string | null;
	rejectionReason: string | null;
	surveys: Array<{
		id: string;
		eventId: string;
		audience: string;
		url: string;
		sendAt: string;
		sentAt: string | null;
		createdAt: string;
	}>;
}

export interface AttendeeItem {
	memberId: string;
	userId: string;
	user: { id: string; name: string; image: string | null };
	status: "approved" | "pending" | "waitlisted" | "cancelled" | "rejected";
	showInAttendeeList: boolean;
	checkedIn: boolean;
	checkedInAt: string | null;
	createdAt: string;
}

export interface CreateEventParams {
	title: string;
	description: string;
	coverImage?: string;
	eventType: string;
	startDate: string;
	endDate: string;
	location?: string;
	meetingPlatform?: string;
	meetingUrl?: string;
	requiresRegistration?: boolean;
	registrationDeadline?: string;
	registrationMode?: "open" | "approval";
	capacity?: number;
	checkInEnabled?: boolean;
	remindersEnabled?: boolean;
	attendeeListVisible?: boolean;
}

export interface UpdateEventParams
	extends Omit<
		CreateEventParams,
		| "coverImage"
		| "location"
		| "meetingPlatform"
		| "meetingUrl"
		| "registrationDeadline"
		| "capacity"
	> {
	coverImage?: string | null;
	location?: string | null;
	meetingPlatform?: string | null;
	meetingUrl?: string | null;
	registrationDeadline?: string | null;
	capacity?: number | null;
	notifyAttendees?: boolean;
}

export async function listMyEvents(
	filter: "upcoming" | "past" | "current",
	userId: string,
) {
	const qs = new URLSearchParams({ filter, userId });
	return apiFetch<{ status: "ok"; data: EventItem[] }>(
		`/api/events?${qs.toString()}`,
	);
}

export async function listLatestEvents(limit = 3) {
	const qs = new URLSearchParams({ limit: String(limit) });
	return apiFetch<{ status: "ok"; data: EventItem[] }>(
		`/api/events?${qs.toString()}`,
	);
}

export async function listPublicEvents(params?: {
	filter?: "upcoming" | "current" | "past";
	search?: string;
}) {
	const qs = new URLSearchParams();
	if (params?.filter) qs.set("filter", params.filter);
	if (params?.search) qs.set("search", params.search);
	const query = qs.toString();
	return apiFetch<{ status: "ok"; data: EventItem[] }>(
		`/api/events${query ? `?${query}` : ""}`,
	);
}

export async function getEventDetail(id: string) {
	return apiFetch<{ status: "ok"; data: AdminEventItem }>(`/api/events/${id}`);
}

export async function updateEvent(id: string, params: UpdateEventParams) {
	return apiFetch<{ status: "ok"; data: AdminEventItem }>(`/api/events/${id}`, {
		method: "PUT",
		body: JSON.stringify(params),
	});
}

export async function deleteEvent(id: string) {
	return apiFetch<void>(`/api/events/${id}`, { method: "DELETE" });
}

export async function submitEventForReview(id: string) {
	return apiFetch<{ status: "ok"; data: AdminEventItem }>(
		`/api/events/${id}/submit`,
		{ method: "POST" },
	);
}

export async function registerForEvent(
	id: string,
	params?: { showInAttendeeList?: boolean },
) {
	return apiFetch<{ status: "ok"; data: AttendeeItem }>(
		`/api/events/${id}/register`,
		{
			method: "POST",
			body: JSON.stringify(params ?? {}),
		},
	);
}

export async function unregisterFromEvent(id: string) {
	return apiFetch<{ status: "ok"; data: AttendeeItem }>(
		`/api/events/${id}/unregister`,
		{ method: "POST" },
	);
}

export async function listEventAttendees(
	eventId: string,
	status?: "approved" | "pending" | "waitlisted" | "cancelled" | "rejected",
) {
	const qs = new URLSearchParams();
	if (status) qs.set("status", status);
	const query = qs.toString();
	return apiFetch<{ status: "ok"; data: AttendeeItem[] }>(
		`/api/events/${eventId}/attendees${query ? `?${query}` : ""}`,
	);
}

export async function updateAttendeeStatus(
	eventId: string,
	memberId: string,
	status: "approved" | "pending" | "waitlisted" | "cancelled" | "rejected",
) {
	return apiFetch<{ status: "ok"; data: AttendeeItem }>(
		`/api/events/${eventId}/attendees/${memberId}`,
		{
			method: "PUT",
			body: JSON.stringify({ status }),
		},
	);
}

export async function closeEventRegistration(id: string) {
	return apiFetch<{ status: "ok"; data: AdminEventItem }>(
		`/api/events/${id}/close-registration`,
		{ method: "POST" },
	);
}

export async function reopenEventRegistration(id: string) {
	return apiFetch<{ status: "ok"; data: AdminEventItem }>(
		`/api/events/${id}/reopen-registration`,
		{ method: "POST" },
	);
}

export async function cancelEvent(id: string) {
	return apiFetch<{ status: "ok"; data: AdminEventItem }>(
		`/api/events/${id}/cancel`,
		{ method: "POST" },
	);
}

export async function checkInAttendee(eventId: string, ticketToken: string) {
	return apiFetch<{
		status: "ok";
		data: {
			memberId: string;
			userId: string;
			user: { id: string; name: string; image: string | null };
			checkedIn: boolean;
			checkedInAt: string;
		};
	}>(`/api/events/${eventId}/check-in`, {
		method: "POST",
		body: JSON.stringify({ ticketToken }),
	});
}

export interface OrganizerItem {
	memberId: string;
	userId: string;
	user: { id: string; name: string; image: string | null };
	role: string;
	createdAt: string;
}

export async function addOrganizer(eventId: string, userId: string) {
	return apiFetch<{ status: "ok"; data: OrganizerItem }>(
		`/api/events/${eventId}/organizers`,
		{
			method: "POST",
			body: JSON.stringify({ userId }),
		},
	);
}

export async function removeOrganizer(eventId: string, userId: string) {
	return apiFetch<void>(`/api/events/${eventId}/organizers/${userId}`, {
		method: "DELETE",
	});
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

export async function createEvent(params: CreateEventParams) {
	return apiFetch<{ status: "ok"; data: EventItem }>("/api/events", {
		method: "POST",
		body: JSON.stringify(params),
	});
}
