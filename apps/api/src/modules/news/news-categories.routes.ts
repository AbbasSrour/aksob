import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import { NEWS_ERRORS } from "@/modules/news/constant/news-errors.constant";
import { createNewsCategoryBody } from "@/modules/news/schema/news-category.schema";
import {
	newsCategoryListResponse,
	newsCategoryResponseSchema,
} from "@/modules/news/schema/news-response.schema";
import { authContext } from "@/plugins/auth";

export const newsCategoriesModule = new Elysia({
	prefix: "/api/news/categories",
})
	.use(authContext)
	.get(
		"/",
		async () => {
			const categories = await db.query.newsCategory.findMany({
				orderBy: (cat, { asc }) => [asc(cat.name)],
			});

			return categories.map((cat) => ({
				id: cat.id,
				name: cat.name,
				createdAt: cat.createdAt.toISOString(),
				updatedAt: cat.updatedAt.toISOString(),
			}));
		},
		{
			auth: "optional",
			response: { 200: newsCategoryListResponse },
			detail: {
				tags: ["News"],
				summary: "List news categories",
				description: "Public. Returns all categories for use in dropdowns.",
			},
		},
	)
	.post(
		"/",
		async ({ body, set }) => {
			const existing = await db.query.newsCategory.findFirst({
				where: eq(schema.newsCategory.name, body.name),
			});

			if (existing) {
				set.status = NEWS_ERRORS.NEWS_CATEGORY_ALREADY_EXISTS.httpStatus;
				return {
					status: "error",
					code: NEWS_ERRORS.NEWS_CATEGORY_ALREADY_EXISTS.code,
					error: NEWS_ERRORS.NEWS_CATEGORY_ALREADY_EXISTS.message,
				};
			}

			const now = new Date();
			const categoryId = crypto.randomUUID();

			await db.insert(schema.newsCategory).values({
				id: categoryId,
				name: body.name,
				createdAt: now,
				updatedAt: now,
			});

			return {
				status: "ok",
				data: {
					id: categoryId,
					name: body.name,
					createdAt: now.toISOString(),
					updatedAt: now.toISOString(),
				},
			};
		},
		{
			auth: true,
			role: "admin",
			body: createNewsCategoryBody,
			response: { 201: newsCategoryResponseSchema },
			detail: {
				tags: ["News"],
				summary: "Create a news category",
				description: "Admin only. Category names must be unique.",
			},
		},
	)
	.delete(
		"/:id",
		async ({ params, set }) => {
			const category = await db.query.newsCategory.findFirst({
				where: eq(schema.newsCategory.id, params.id),
			});

			if (!category) {
				set.status = NEWS_ERRORS.NEWS_CATEGORY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: NEWS_ERRORS.NEWS_CATEGORY_NOT_FOUND.code,
					error: NEWS_ERRORS.NEWS_CATEGORY_NOT_FOUND.message,
				};
			}

			await db
				.delete(schema.newsCategory)
				.where(eq(schema.newsCategory.id, params.id));

			set.status = 204;
		},
		{
			auth: true,
			role: "admin",
			detail: {
				tags: ["News"],
				summary: "Delete a news category",
				description:
					"Admin only. Category FK on articles is set to null on delete.",
			},
		},
	);

export default newsCategoriesModule;
