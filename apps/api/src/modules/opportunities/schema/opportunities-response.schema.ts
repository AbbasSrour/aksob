import { t } from "elysia";
import { paginatedListResponse } from "@/utils/paginate";

export const opportunityStatusEnum = t.Enum({
	pending: "pending",
	approved: "approved",
	rejected: "rejected",
} as const);

const opportunityAuthorSchema = t.Object({
	id: t.String(),
	name: t.String(),
	image: t.Union([t.String(), t.Null()]),
	major: t.Optional(t.Nullable(t.String())),
});

const opportunityReviewerSchema = t.Object({
	id: t.String(),
	name: t.String(),
});

export const opportunityResponseSchema = t.Object({
	id: t.String(),
	type: t.Union([t.Literal("job"), t.Literal("internship")]),
	company: t.String(),
	contactEmail: t.Union([t.String(), t.Null()]),
	applyUrl: t.Union([t.String(), t.Null()]),
	status: opportunityStatusEnum,
	author: opportunityAuthorSchema,
	reviewedBy: t.Union([opportunityReviewerSchema, t.Null()]),
	reviewNotes: t.Union([t.String(), t.Null()]),
	reviewedAt: t.Union([t.String(), t.Null()]),
	createdAt: t.String(),
	updatedAt: t.String(),
});

export const opportunitiesListResponse = paginatedListResponse(
	opportunityResponseSchema,
);
