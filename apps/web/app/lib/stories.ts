import { apiFetch } from "~/app/lib/api";

export type StoryCategory =
	| "career_advancement"
	| "entrepreneurship"
	| "industry_recognition"
	| "social_impact"
	| "academic_achievement"
	| "innovation"
	| "leadership"
	| "community_service"
	| "other";

export interface StoryAuthor {
	id: string;
	name: string;
	image: string | null;
	major: string | null;
}

export interface Story {
	id: string;
	title: string;
	description: string;
	content: string;
	coverImage: string | null;
	thumbnailImage: string | null;
	category: StoryCategory;
	storyDate: string;
	status: "pending" | "approved" | "rejected";
	author: StoryAuthor;
	reviewedBy: { id: string; name: string } | null;
	reviewNotes: string | null;
	reviewedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

interface StoriesListResponse {
	status: string;
	data: Story[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export async function listApprovedStories(limit = 5) {
	return apiFetch<StoriesListResponse>(
		`/api/stories?status=approved&limit=${limit}`,
	);
}

export const STORY_CATEGORY_LABELS: Record<StoryCategory, string> = {
	career_advancement: "Career Advancement",
	entrepreneurship: "Entrepreneurship",
	industry_recognition: "Industry Recognition",
	social_impact: "Social Impact",
	academic_achievement: "Academic Achievement",
	innovation: "Innovation",
	leadership: "Leadership",
	community_service: "Community Service",
	other: "Other",
};

// ── Single story ────────────────────────────────────────────────────

export async function getStory(id: string) {
	return apiFetch<{ status: "ok"; data: Story }>(`/api/stories/${id}`);
}

// ── Update / Delete ─────────────────────────────────────────────────

export interface UpdateStoryParams {
	title: string;
	description: string;
	content: string;
	category: string;
	storyDate: string;
	coverImage?: string;
	thumbnailImage?: string;
}

export async function updateStory(id: string, params: UpdateStoryParams) {
	return apiFetch<{ status: "ok"; data: Story }>(`/api/stories/${id}`, {
		method: "PUT",
		body: JSON.stringify(params),
	});
}

export async function deleteStory(id: string) {
	return apiFetch<{ status: "ok" }>(`/api/stories/${id}`, {
		method: "DELETE",
	});
}

// ── Admin: Approve / Reject ─────────────────────────────────────────

export async function approveStory(id: string) {
	return apiFetch<{ status: "ok"; data: Story }>(`/api/stories/${id}/approve`, {
		method: "POST",
	});
}

export async function rejectStory(id: string, reviewNotes: string) {
	return apiFetch<{ status: "ok"; data: Story }>(`/api/stories/${id}/reject`, {
		method: "POST",
		body: JSON.stringify({ reviewNotes }),
	});
}

// ── List with pagination ────────────────────────────────────────────

export interface StoriesListParams {
	page?: number;
	limit?: number;
	status?: "pending" | "approved" | "rejected";
	category?: StoryCategory;
	search?: string;
	authorId?: string;
}

export async function listStories(params?: StoriesListParams) {
	const searchParams = new URLSearchParams();
	if (params?.page) searchParams.set("page", String(params.page));
	if (params?.limit) searchParams.set("limit", String(params.limit));
	if (params?.status) searchParams.set("status", params.status);
	if (params?.category) searchParams.set("category", params.category);
	if (params?.search) searchParams.set("search", params.search);
	if (params?.authorId) searchParams.set("authorId", params.authorId);

	const qs = searchParams.toString();
	return apiFetch<StoriesListResponse>(`/api/stories${qs ? `?${qs}` : ""}`);
}
