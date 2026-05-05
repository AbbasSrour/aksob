import { t } from "elysia";

export const rejectOpportunityBody = t.Object({
	reviewNotes: t.String({ minLength: 1 }),
});
