import { t } from "elysia";
import { storyCategoryEnum } from "@/modules/stories/constant/story-categories.constant";
import { storyStatusEnum } from "@/modules/stories/schema/stories-response.schema";

export const storiesFilters = t.Object({
	category: t.Optional(t.Enum(storyCategoryEnum)),
});

export const storiesPageOptions = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1 })),
	limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
});

export const storiesListOptions = t.Object({
	authorId: t.Optional(t.String()),
	status: t.Optional(storyStatusEnum),
	search: t.Optional(t.String()),
});

export const listStoriesQuery = t.Composite([
	storiesFilters,
	storiesPageOptions,
	storiesListOptions,
]);
