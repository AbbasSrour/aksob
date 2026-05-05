import { t } from "elysia";
import { storyCategoryEnum } from "@/modules/stories/constant/story-categories.constant";

export const createStoryBody = t.Object({
	title: t.String({ minLength: 1 }),
	description: t.String({ minLength: 1 }),
	content: t.String({ minLength: 1 }),
	coverImage: t.Optional(t.String()),
	thumbnailImage: t.Optional(t.String()),
	category: t.Enum(storyCategoryEnum),
	storyDate: t.String({ minLength: 1 }),
	authorId: t.Optional(t.String()),
});
