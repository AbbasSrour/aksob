import { t } from "elysia";

export const rejectResearchBody = t.Object({
	reason: t.String({ minLength: 1 }),
});
