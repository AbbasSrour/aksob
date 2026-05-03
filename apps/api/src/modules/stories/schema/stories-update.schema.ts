import { t } from "elysia";
import { storyCategoryEnum } from "@/modules/stories/constant/story-categories.constant";

export const updateStoryBody = t.Object({
	title: t.String({ minLength: 1 }),
	description: t.String({ minLength: 1 }),
	content: t.String({ minLength: 1 }),
	category: t.Enum(storyCategoryEnum),
	storyDate: t.Optional(t.String()),
});
