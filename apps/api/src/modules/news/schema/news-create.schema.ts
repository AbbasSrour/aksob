import { t } from "elysia";

export const createNewsBody = t.Object({
	title: t.String({ minLength: 1 }),
	excerpt: t.String({ minLength: 1 }),
	content: t.String({ minLength: 1 }),
	coverImage: t.Optional(t.String()),
	thumbnailImage: t.Optional(t.String()),
	readTime: t.Optional(t.Number()),
	categoryId: t.Optional(t.String()),
	authorId: t.Optional(t.String()),
	date: t.Optional(t.String({ minLength: 1 })),
});
