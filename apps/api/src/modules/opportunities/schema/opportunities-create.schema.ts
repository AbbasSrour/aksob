import { t } from "elysia";

export const createOpportunityBody = t.Object({
	type: t.Union([t.Literal("job"), t.Literal("internship")]),
	company: t.String({ minLength: 1 }),
	contactEmail: t.Optional(t.String({ format: "email" })),
	applyUrl: t.Optional(t.String({ format: "uri" })),
	authorId: t.Optional(t.String()),
});
