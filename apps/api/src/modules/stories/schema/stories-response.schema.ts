import { t } from "elysia";
import { storyCategoryEnum } from "@/modules/stories/constant/story-categories.constant";
import { paginatedListResponse } from "@/utils/paginate";

export const storyStatusEnum = t.Enum({
	pending: "pending",
	approved: "approved",
	rejected: "rejected",
} as const);

const storyAuthorSchema = t.Object({
	id: t.String(),
	name: t.String(),
	image: t.Union([t.String(), t.Null()]),
	program: t.Optional(t.Nullable(t.String())),
});

const storyReviewerSchema = t.Object({
	id: t.String(),
	name: t.String(),
});

export const storyResponseSchema = t.Object({
	id: t.String(),
	title: t.String(),
	description: t.String(),
	content: t.String(),
	category: t.Enum(storyCategoryEnum),
	storyDate: t.String(),
	status: storyStatusEnum,
	author: storyAuthorSchema,
	reviewedBy: t.Union([storyReviewerSchema, t.Null()]),
	reviewNotes: t.Union([t.String(), t.Null()]),
	reviewedAt: t.Union([t.String(), t.Null()]),
	createdAt: t.String(),
	updatedAt: t.String(),
});

export const storiesListResponse = paginatedListResponse(storyResponseSchema);
