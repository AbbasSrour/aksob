import { t } from "elysia";

export const listDonorsQuery = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1 })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
});
