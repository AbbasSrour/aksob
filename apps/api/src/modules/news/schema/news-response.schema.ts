import { t } from "elysia";
import { paginatedListResponse } from "@/utils/paginate";

export const newsStatusEnum = t.Enum({
	draft: "draft",
	published: "published",
});

const newsAuthorSchema = t.Object({
	id: t.String(),
	name: t.String(),
	image: t.Union([t.String(), t.Null()]),
});

const newsCategorySchema = t.Object({
	id: t.String(),
	name: t.String(),
});

// Inner article shape (used inside wrappers)
export const newsArticleSchema = t.Object({
	id: t.String(),
	title: t.String(),
	excerpt: t.String(),
	content: t.String(),
	coverImage: t.Union([t.String(), t.Null()]),
	thumbnailImage: t.Union([t.String(), t.Null()]),
	readTime: t.Union([t.Number(), t.Null()]),
	status: newsStatusEnum,
	publishedAt: t.Union([t.String(), t.Null()]),
	date: t.Union([t.String(), t.Null()]),
	author: newsAuthorSchema,
	category: t.Union([newsCategorySchema, t.Null()]),
	createdAt: t.String(),
	updatedAt: t.String(),
});

// Single article response: { status: "ok", data: article }
export const newsResponseSchema = t.Object({
	status: t.Literal("ok"),
	data: newsArticleSchema,
});

// Paginated list response
export const newsListResponse = paginatedListResponse(newsArticleSchema);

// Inner category shape
export const newsCategoryItemSchema = t.Object({
	id: t.String(),
	name: t.String(),
	createdAt: t.String(),
	updatedAt: t.String(),
});

// Single category response: { status: "ok", data: category }
export const newsCategoryResponseSchema = t.Object({
	status: t.Literal("ok"),
	data: newsCategoryItemSchema,
});

// Category list response (raw array from backend)
export const newsCategoryListResponse = t.Array(newsCategoryItemSchema);
