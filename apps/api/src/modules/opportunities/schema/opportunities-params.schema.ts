import { t } from "elysia";

export const opportunitiesPageOptions = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1 })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
});

export const opportunitiesListOptions = t.Object({
	authorId: t.Optional(t.String()),
	status: t.Optional(
		t.Enum({
			pending: "pending",
			approved: "approved",
			rejected: "rejected",
		} as const),
	),
	search: t.Optional(t.String()),
	type: t.Optional(
		t.Enum({
			job: "job",
			internship: "internship",
		} as const),
	),
});

export const listOpportunitiesQuery = t.Composite([
	opportunitiesPageOptions,
	opportunitiesListOptions,
]);
