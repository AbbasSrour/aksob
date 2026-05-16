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
