import { and, count, desc, eq, like } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import {
	deleteUploadThingFiles,
	extractImageUrlsFromHtml,
} from "@/lib/uploadthing";
import { NEWS_ERRORS } from "@/modules/news/constant/news-errors.constant";
import { createNewsBody } from "@/modules/news/schema/news-create.schema";
import { listNewsQuery } from "@/modules/news/schema/news-params.schema";
import {
	newsListResponse,
	newsResponseSchema,
} from "@/modules/news/schema/news-response.schema";
import { updateNewsBody } from "@/modules/news/schema/news-update.schema";
import { toNewsDto } from "@/modules/news/utils/news.mapper";
import { USER_ERRORS } from "@/modules/users/constant/user-errors.constant";
import { authContext } from "@/plugins/auth";
import { paginate } from "@/utils/paginate";

export const newsModule = new Elysia({ prefix: "/api/news" })
	.use(authContext)
	.get(
		"/",
		async ({ query, user }) => {
			const page = paginate(query);
			const { category, search, status } = query;
			const conditions = [];

			// Search by title
			if (search) {
				conditions.push(like(schema.news.title, `%${search}%`));
			}

			// Public / non-admin: only published. Admin: all, optionally filtered by status.
			if (!user || user.role !== "admin") {
				conditions.push(eq(schema.news.status, "published"));
			} else if (status) {
				conditions.push(eq(schema.news.status, status));
			}

			// Filter by category
			if (category) {
				conditions.push(eq(schema.news.categoryId, category));
			}

			const where = conditions.length > 0 ? and(...conditions) : undefined;

			const [countResult] = await db
				.select({ count: count() })
				.from(schema.news)
				.where(where);

			const articles = await db.query.news.findMany({
				where,
				orderBy: [desc(schema.news.createdAt)],
				limit: page.limit,
				offset: page.offset,
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
						} as const,
					},
					category: true,
				},
			});

			return {
				status: "ok",
				data: articles.map(toNewsDto),
				meta: page.meta(countResult?.count ?? 0),
			};
		},
		{
			auth: "optional",
			query: listNewsQuery,
			response: newsListResponse,
			detail: {
				tags: ["News"],
				summary: "List news articles",
				description:
					"Public sees published only. Admins see all. " +
					"Filter by category, status, and search.",
			},
		},
	)
	.post(
		"/",
		async ({ user, body, set }) => {
			const now = new Date();
			const articleId = crypto.randomUUID();

			// Admin can assign a different author
			let authorId = user.id;
			if (body.authorId) {
				const assignedUser = await db.query.user.findFirst({
					where: eq(schema.user.id, body.authorId),
				});
				if (!assignedUser) {
					set.status = USER_ERRORS.USER_NOT_FOUND.httpStatus;
					return {
						status: "error",
						code: USER_ERRORS.USER_NOT_FOUND.code,
						error: USER_ERRORS.USER_NOT_FOUND.message,
					};
				}
				authorId = assignedUser.id;
			}

			await db.insert(schema.news).values({
				id: articleId,
				title: body.title,
				excerpt: body.excerpt,
				content: body.content,
				coverImage: body.coverImage ?? null,
				thumbnailImage: body.thumbnailImage ?? null,
				readTime: body.readTime ?? null,
				status: "draft",
				authorId,
				categoryId: body.categoryId ?? null,
				publishedAt: null,
				date: body.date ? new Date(body.date) : null,
				createdAt: now,
				updatedAt: now,
			});

			const article = await db.query.news.findFirst({
				where: eq(schema.news.id, articleId),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
						} as const,
					},
					category: true,
				},
			});

			// Guaranteed to exist — just inserted
			return { status: "ok", data: toNewsDto(article!) };
		},
		{
			auth: true,
			role: "admin",
			body: createNewsBody,
			response: { 201: newsResponseSchema },
			detail: {
				tags: ["News"],
				summary: "Create a news article",
				description:
					"Admin only. Article starts as draft. " +
					"Use the publish endpoint to make it visible.",
			},
		},
	)
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const article = await db.query.news.findFirst({
				where: eq(schema.news.id, params.id),
			});

			if (!article) {
				set.status = NEWS_ERRORS.NEWS_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: NEWS_ERRORS.NEWS_NOT_FOUND.code,
					error: NEWS_ERRORS.NEWS_NOT_FOUND.message,
				};
			}

			// Collect old image URLs before overwriting
			const oldImageUrls: string[] = [
				article.coverImage,
				article.thumbnailImage,
				...(article.content ? extractImageUrlsFromHtml(article.content) : []),
			].filter((url): url is string => url !== null);

			// Admin can reassign author
			let authorId = article.authorId;
			if (body.authorId) {
				const assignedUser = await db.query.user.findFirst({
					where: eq(schema.user.id, body.authorId),
				});
				if (!assignedUser) {
					set.status = USER_ERRORS.USER_NOT_FOUND.httpStatus;
					return {
						status: "error",
						code: USER_ERRORS.USER_NOT_FOUND.code,
						error: USER_ERRORS.USER_NOT_FOUND.message,
					};
				}
				authorId = assignedUser.id;
			}

			const now = new Date();

			await db
				.update(schema.news)
				.set({
					title: body.title,
					excerpt: body.excerpt,
					content: body.content,
					coverImage: body.coverImage ?? null,
					thumbnailImage: body.thumbnailImage ?? null,
					readTime: body.readTime ?? null,
					categoryId: body.categoryId ?? null,
					authorId,
					status: "draft",
					publishedAt: null,
					date: body.date ? new Date(body.date) : null,
					updatedAt: now,
				})
				.where(eq(schema.news.id, params.id));

			const updated = await db.query.news.findFirst({
				where: eq(schema.news.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
						} as const,
					},
					category: true,
				},
			});

			// Delete old images that are no longer referenced
			const newImageUrls: string[] = [
				body.coverImage ?? null,
				body.thumbnailImage ?? null,
				...(body.content ? extractImageUrlsFromHtml(body.content) : []),
			].filter((url): url is string => url !== null);
			const orphanedUrls = oldImageUrls.filter(
				(url) => !newImageUrls.includes(url),
			);
			if (orphanedUrls.length > 0) {
				void deleteUploadThingFiles(orphanedUrls);
			}

			return { status: "ok", data: toNewsDto(updated!) };
		},
		{
			auth: true,
			body: updateNewsBody,
			response: { 200: newsResponseSchema },
			detail: {
				tags: ["News"],
				summary: "Update a news article",
				description:
					"Admin only. Resets status to draft. " +
					"Re-publish to make changes visible.",
			},
		},
	)
	.delete(
		"/:id",
		async ({ params, set }) => {
			const article = await db.query.news.findFirst({
				where: eq(schema.news.id, params.id),
			});

			if (!article) {
				set.status = NEWS_ERRORS.NEWS_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: NEWS_ERRORS.NEWS_NOT_FOUND.code,
					error: NEWS_ERRORS.NEWS_NOT_FOUND.message,
				};
			}

			await db.delete(schema.news).where(eq(schema.news.id, params.id));

			// Delete all article images from storage (fire-and-forget)
			const allImageUrls: string[] = [
				article.coverImage,
				article.thumbnailImage,
				...(article.content ? extractImageUrlsFromHtml(article.content) : []),
			].filter((url): url is string => url !== null);
			if (allImageUrls.length > 0) {
				void deleteUploadThingFiles(allImageUrls);
			}

			set.status = 204;
		},
		{
			auth: true,
			role: "admin",
			detail: {
				tags: ["News"],
				summary: "Delete a news article",
				description:
					"Admin only. Deletes the article and its associated images.",
			},
		},
	)
	.post(
		"/:id/publish",
		async ({ params, set }) => {
			const article = await db.query.news.findFirst({
				where: eq(schema.news.id, params.id),
			});

			if (!article) {
				set.status = NEWS_ERRORS.NEWS_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: NEWS_ERRORS.NEWS_NOT_FOUND.code,
					error: NEWS_ERRORS.NEWS_NOT_FOUND.message,
				};
			}

			const now = new Date();

			await db
				.update(schema.news)
				.set({
					status: "published",
					publishedAt: now,
					updatedAt: now,
				})
				.where(eq(schema.news.id, params.id));

			const updated = await db.query.news.findFirst({
				where: eq(schema.news.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
						} as const,
					},
					category: true,
				},
			});

			return { status: "ok", data: toNewsDto(updated!) };
		},
		{
			auth: true,
			role: "admin",
			response: { 200: newsResponseSchema },
			detail: {
				tags: ["News"],
				summary: "Publish a news article",
				description: "Admin only. Sets the article status to published.",
			},
		},
	)
	.post(
		"/:id/unpublish",
		async ({ params, set }) => {
			const article = await db.query.news.findFirst({
				where: eq(schema.news.id, params.id),
			});

			if (!article) {
				set.status = NEWS_ERRORS.NEWS_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: NEWS_ERRORS.NEWS_NOT_FOUND.code,
					error: NEWS_ERRORS.NEWS_NOT_FOUND.message,
				};
			}

			const now = new Date();

			await db
				.update(schema.news)
				.set({
					status: "draft",
					publishedAt: null,
					updatedAt: now,
				})
				.where(eq(schema.news.id, params.id));

			const updated = await db.query.news.findFirst({
				where: eq(schema.news.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
						} as const,
					},
					category: true,
				},
			});

			return { status: "ok", data: toNewsDto(updated!) };
		},
		{
			auth: true,
			role: "admin",
			response: { 200: newsResponseSchema },
			detail: {
				tags: ["News"],
				summary: "Unpublish a news article",
				description: "Admin only. Sets the article status back to draft.",
			},
		},
	)
	.get(
		"/:id",
		async ({ params, user, set }) => {
			const article = await db.query.news.findFirst({
				where: eq(schema.news.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
						} as const,
					},
					category: true,
				},
			});

			if (!article) {
				set.status = NEWS_ERRORS.NEWS_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: NEWS_ERRORS.NEWS_NOT_FOUND.code,
					error: NEWS_ERRORS.NEWS_NOT_FOUND.message,
				};
			}

			// Published: public. Admin: any status.
			if (article.status === "published" || user?.role === "admin") {
				return { status: "ok", data: toNewsDto(article) };
			}

			// Non-published and non-admin → 404
			set.status = NEWS_ERRORS.NEWS_NOT_FOUND.httpStatus;
			return {
				status: "error",
				code: NEWS_ERRORS.NEWS_NOT_FOUND.code,
				error: NEWS_ERRORS.NEWS_NOT_FOUND.message,
			};
		},
		{
			auth: "optional",
			response: { 200: newsResponseSchema },
			detail: {
				tags: ["News"],
				summary: "Get a news article by id",
				description: "Published articles are public. Admins see any status.",
			},
		},
	);

export default newsModule;
