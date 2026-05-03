import { t } from "elysia";

export const rejectStoryBody = t.Object({
	reviewNotes: t.String({ minLength: 1 }),
});
