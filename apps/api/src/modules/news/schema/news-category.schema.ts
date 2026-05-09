import { t } from "elysia";

export const createNewsCategoryBody = t.Object({
	name: t.String({ minLength: 1 }),
});
