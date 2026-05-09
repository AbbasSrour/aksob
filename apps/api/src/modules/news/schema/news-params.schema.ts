import { t } from "elysia";
import { newsStatusEnum } from "@/modules/news/schema/news-response.schema";

const newsFilters = t.Object({
	category: t.Optional(t.String()),
});

const newsPageOptions = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1 })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
});

const newsListOptions = t.Object({
	search: t.Optional(t.String()),
	status: t.Optional(newsStatusEnum),
});

export const listNewsQuery = t.Composite([
	newsFilters,
	newsPageOptions,
	newsListOptions,
]);
