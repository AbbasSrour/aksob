import { and, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import { STORIES_ERRORS } from "@/modules/stories/constant/stories-errors.constant";
import { createStoryBody } from "@/modules/stories/schema/stories-create.schema";
import { updateStoryBody } from "@/modules/stories/schema/stories-update.schema";
import { rejectStoryBody } from "@/modules/stories/schema/stories-reject.schema";
import { listStoriesQuery } from "@/modules/stories/schema/stories-params.schema";
import { storiesListResponse } from "@/modules/stories/schema/stories-response.schema";
import { toStoryDto } from "@/modules/stories/utils/stories.mapper";
import { USER_ERRORS } from "@/modules/users/constant/user-errors.constant";
import { authContext } from "@/plugins/auth";
import { paginate } from "@/utils/paginate";

export const storiesModule = new Elysia({ prefix: "/stories" })
	.use(authContext)
	// List stories with visibility based on auth status and role
	.get(
		"/",
		async ({ query, user }) => {
			const page = paginate(query);
			const { authorId, status, category, search } = query;
			const conditions = [];

			// Search by title or author name (across story + user tables)
			if (search) {
				const term = `%${search}%`;
				const matchedIds = await db
					.select({ id: schema.story.id })
					.from(schema.story)
					.leftJoin(schema.user, eq(schema.story.authorId, schema.user.id))
					.where(
						or(
							like(schema.story.title, term),
							like(schema.user.name, term),
						),
					);

				if (matchedIds.length === 0) {
					return {
						status: "ok",
						data: [],
						meta: page.meta(0),
					};
				}

				conditions.push(
					inArray(
						schema.story.id,
						matchedIds.map((r) => r.id),
					),
				);
			}

			// Anonymous: only approved, optionally filtered by authorId
			if (!user) {
				conditions.push(eq(schema.story.status, "approved"));
				if (authorId) conditions.push(eq(schema.story.authorId, authorId));
			}
			// Admin: everything, optionally filtered
			else if (user.role === "admin") {
				if (status) conditions.push(eq(schema.story.status, status));
				if (authorId) conditions.push(eq(schema.story.authorId, authorId));
			}
			// Regular user viewing a specific other user
			else if (authorId !== undefined && authorId !== user.id) {
				conditions.push(
					eq(schema.story.status, "approved"),
					eq(schema.story.authorId, authorId),
				);
			}
			// Regular user viewing own stories
			else if (authorId === user.id) {
				conditions.push(eq(schema.story.authorId, user.id));
				if (status) conditions.push(eq(schema.story.status, status));
			}
			// Regular user with status filter (no authorId)
			else if (status === "pending" || status === "rejected") {
				conditions.push(
					eq(schema.story.authorId, user.id),
					eq(schema.story.status, status),
				);
			}
			// Regular user with approved status filter
			else if (status === "approved") {
				conditions.push(eq(schema.story.status, "approved"));
			}
			// Regular user, no params: approved OR own
			else {
				conditions.push(
					or(
						eq(schema.story.status, "approved"),
						eq(schema.story.authorId, user.id),
					),
				);
			}

			if (category) {
				conditions.push(eq(schema.story.category, category));
			}

			const where =
				conditions.length > 0 ? and(...conditions) : undefined;

			const [countResult] = await db
				.select({ count: count() })
				.from(schema.story)
				.where(where);

			const stories = await db.query.story.findMany({
				where,
				orderBy: [desc(schema.story.createdAt)],
				limit: page.limit,
				offset: page.offset,
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
							major: true,
						} as const,
					},
				},
			});

			return {
				status: "ok",
				data: stories.map(toStoryDto),
				meta: page.meta(countResult?.count ?? 0),
			};
		},
		{
			auth: "optional",
			query: listStoriesQuery,
			response: storiesListResponse,
			detail: {
				tags: ["Stories"],
				summary: "List stories",
				description:
					"Visibility depends on authentication status and role. " +
					"Anonymous sees approved only. Users see approved + their own. " +
					"Filter by authorId, status, and category.",
			},
		},
	)
	// Get story by id (approved = public, author sees own)
	.get(
		"/:id",
		async ({ params, user, set }) => {
			const story = await db.query.story.findFirst({
				where: eq(schema.story.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
							major: true,
						} as const,
					},
					reviewer: {
						columns: {
							id: true,
							name: true,
						},
					},
				},
			});

			if (!story) {
				set.status = STORIES_ERRORS.STORY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: STORIES_ERRORS.STORY_NOT_FOUND.code,
					error: STORIES_ERRORS.STORY_NOT_FOUND.message,
				};
			}

			if (story.status === "approved") {
				return { status: "ok", data: toStoryDto(story) };
			}

			if (user?.role === "admin") {
				return { status: "ok", data: toStoryDto(story) };
			}

			if (user?.id !== story.authorId) {
				set.status = STORIES_ERRORS.STORY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: STORIES_ERRORS.STORY_NOT_FOUND.code,
					error: STORIES_ERRORS.STORY_NOT_FOUND.message,
				};
			}

			return { status: "ok", data: toStoryDto(story) };
		},
		{
			auth: "optional",
			detail: {
				tags: ["Stories"],
				summary: "Get a story by id",
				description:
					"Approved stories are public. Admins see all. Authors see their own regardless of status.",
			},
		},
	)
	// Authenticated: create a story
	.post(
		"/",
		async ({ user, body, set }) => {
			const isAdmin = user.role === "admin";

			let authorId = user.id;
			let storyAuthor = {
				id: user.id,
				name: user.name,
				image: user.image,
				major: user.major,
			};
			const status: "pending" | "approved" = isAdmin ? "approved" : "pending";
			const reviewedBy: string | null = isAdmin ? user.id : null;
			const reviewedAt: Date | null = isAdmin ? new Date() : null;

			if (body.authorId) {
				if (!isAdmin) {
					set.status = STORIES_ERRORS.CANNOT_ASSIGN.httpStatus;
					return {
						status: "error",
						code: STORIES_ERRORS.CANNOT_ASSIGN.code,
						error: STORIES_ERRORS.CANNOT_ASSIGN.message,
					};
				}

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
				storyAuthor = {
					id: assignedUser.id,
					name: assignedUser.name,
					image: assignedUser.image,
					major: assignedUser.major,
				};
			}

			const now = new Date();
			const storyId = crypto.randomUUID();

			await db.insert(schema.story).values({
				id: storyId,
				title: body.title,
				description: body.description,
				content: body.content,
				category: body.category,
				storyDate: body.storyDate ? new Date(body.storyDate) : null,
				status,
				authorId,
				reviewedBy,
				reviewNotes: null,
				reviewedAt,
				createdAt: now,
				updatedAt: now,
			});

			const reviewerUser = reviewedBy ? { id: user.id, name: user.name } : null;

			return {
				status: "ok",
				data: {
					id: storyId,
					title: body.title,
					description: body.description,
					content: body.content,
					category: body.category,
					storyDate: body.storyDate ?? null,
					status,
					author: storyAuthor,
					reviewedBy: reviewerUser,
					reviewNotes: null,
					reviewedAt: reviewedAt?.toISOString() ?? null,
					createdAt: now.toISOString(),
					updatedAt: now.toISOString(),
				},
			};
		},
		{
			auth: true,
			body: createStoryBody,
			detail: {
				tags: ["Stories"],
				summary: "Create a story",
				description:
					"Creates a story. Regular users get pending status. " +
					"Admins can provide authorId to assign the story. " +
					"Admin-created stories are auto-approved.",
			},
		},
	)
	// Author or admin: full update. User resets to pending, admin preserves status.
	.put(
		"/:id",
		async ({ params, user, body, set }) => {
			const story = await db.query.story.findFirst({
				where: eq(schema.story.id, params.id),
			});

			if (!story) {
				set.status = STORIES_ERRORS.STORY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: STORIES_ERRORS.STORY_NOT_FOUND.code,
					error: STORIES_ERRORS.STORY_NOT_FOUND.message,
				};
			}

			if (user.id !== story.authorId && user.role !== "admin") {
				set.status = STORIES_ERRORS.NOT_AUTHOR.httpStatus;
				return {
					status: "error",
					code: STORIES_ERRORS.NOT_AUTHOR.code,
					error: STORIES_ERRORS.NOT_AUTHOR.message,
				};
			}

			const now = new Date();
			const isAdmin = user.role === "admin";

			await db
				.update(schema.story)
				.set({
					title: body.title,
					description: body.description,
					content: body.content,
					category: body.category,
					storyDate: body.storyDate ? new Date(body.storyDate) : null,
					status: isAdmin ? story.status : "pending",
					reviewedBy: isAdmin ? story.reviewedBy : null,
					reviewNotes: isAdmin ? story.reviewNotes : null,
					reviewedAt: isAdmin ? story.reviewedAt : null,
					updatedAt: now,
				})
				.where(eq(schema.story.id, params.id));

			const updated = await db.query.story.findFirst({
				where: eq(schema.story.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
							major: true,
						} as const,
					},
				},
			});

			return { status: "ok", data: toStoryDto(updated!) };
		},
		{
			auth: true,
			body: updateStoryBody,
			detail: {
				tags: ["Stories"],
				summary: "Update a story",
				description:
					"Full update by the author or an admin. " +
					"User edits reset status to pending. " +
					"Admin edits preserve the existing status and review data.",
			},
		},
	)
	// Author or admin: delete a story
	.delete(
		"/:id",
		async ({ params, user, set }) => {
			const story = await db.query.story.findFirst({
				where: eq(schema.story.id, params.id),
			});

			if (!story) {
				set.status = STORIES_ERRORS.STORY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: STORIES_ERRORS.STORY_NOT_FOUND.code,
					error: STORIES_ERRORS.STORY_NOT_FOUND.message,
				};
			}

			if (user.id !== story.authorId && user.role !== "admin") {
				set.status = STORIES_ERRORS.NOT_AUTHOR.httpStatus;
				return {
					status: "error",
					code: STORIES_ERRORS.NOT_AUTHOR.code,
					error: STORIES_ERRORS.NOT_AUTHOR.message,
				};
			}

			await db.delete(schema.story).where(eq(schema.story.id, params.id));

			return { status: "ok" };
		},
		{
			auth: true,
			detail: {
				tags: ["Stories"],
				summary: "Delete a story",
				description: "Delete a story. Allowed for the author or an admin.",
			},
		},
	)
	// Admin: approve a story
	.post(
		"/:id/approve",
		async ({ params, user, set }) => {
			const story = await db.query.story.findFirst({
				where: eq(schema.story.id, params.id),
			});

			if (!story) {
				set.status = STORIES_ERRORS.STORY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: STORIES_ERRORS.STORY_NOT_FOUND.code,
					error: STORIES_ERRORS.STORY_NOT_FOUND.message,
				};
			}

			const now = new Date();

			await db
				.update(schema.story)
				.set({
					status: "approved",
					reviewedBy: user.id,
					reviewNotes: null,
					reviewedAt: now,
					updatedAt: now,
				})
				.where(eq(schema.story.id, params.id));

			const updated = await db.query.story.findFirst({
				where: eq(schema.story.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
							major: true,
						} as const,
					},
					reviewer: {
						columns: {
							id: true,
							name: true,
						},
					},
				},
			});

			return { status: "ok", data: toStoryDto(updated!) };
		},
		{
			role: "admin",
			detail: {
				tags: ["Stories"],
				summary: "Approve a story",
				description: "Admin approves a story. Sets status to approved.",
			},
		},
	)
	// Admin: reject a story
	.post(
		"/:id/reject",
		async ({ params, user, body, set }) => {
			const story = await db.query.story.findFirst({
				where: eq(schema.story.id, params.id),
			});

			if (!story) {
				set.status = STORIES_ERRORS.STORY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: STORIES_ERRORS.STORY_NOT_FOUND.code,
					error: STORIES_ERRORS.STORY_NOT_FOUND.message,
				};
			}

			const now = new Date();

			await db
				.update(schema.story)
				.set({
					status: "rejected",
					reviewedBy: user.id,
					reviewNotes: body.reviewNotes,
					reviewedAt: now,
					updatedAt: now,
				})
				.where(eq(schema.story.id, params.id));

			const updated = await db.query.story.findFirst({
				where: eq(schema.story.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
							major: true,
						} as const,
					},
					reviewer: {
						columns: {
							id: true,
							name: true,
						},
					},
				},
			});

			return { status: "ok", data: toStoryDto(updated!) };
		},
		{
			role: "admin",
			body: rejectStoryBody,
			detail: {
				tags: ["Stories"],
				summary: "Reject a story",
				description:
					"Admin rejects a story with review notes. Sets status to rejected.",
			},
		},
	);
