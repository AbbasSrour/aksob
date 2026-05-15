import { and, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import { RESEARCH_ERRORS } from "@/modules/research/constant/research-errors.constant";
import { createResearchBody } from "@/modules/research/schema/research-create.schema";
import { listResearchQuery } from "@/modules/research/schema/research-params.schema";
import { rejectResearchBody } from "@/modules/research/schema/research-reject.schema";
import { researchListResponse } from "@/modules/research/schema/research-response.schema";
import { updateResearchBody } from "@/modules/research/schema/research-update.schema";
import { toResearchDto } from "@/modules/research/utils/research.mapper";
import { authContext } from "@/plugins/auth";
import { paginate } from "@/utils/paginate";

export const researchModule = new Elysia({ prefix: "/api/research" })
	.use(authContext)
	// List research with visibility based on auth status and role
	.get(
		"/",
		async ({ query, user }) => {
			const page = paginate(query);
			const { authorId, status, researchType, search } = query;
			const conditions = [];

			// Search by title or author name (across research + user tables)
			if (search) {
				const term = `%${search}%`;
				const matchedIds = await db
					.select({ id: schema.research.id })
					.from(schema.research)
					.leftJoin(schema.user, eq(schema.research.authorId, schema.user.id))
					.where(
						or(like(schema.research.title, term), like(schema.user.name, term)),
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
						schema.research.id,
						matchedIds.map((r) => r.id),
					),
				);
			}

			// Anonymous: only approved, optionally filtered by authorId
			if (!user) {
				conditions.push(eq(schema.research.status, "approved"));
				if (authorId) conditions.push(eq(schema.research.authorId, authorId));
			}
			// Admin: everything, optionally filtered
			else if (user.role === "admin") {
				if (status) conditions.push(eq(schema.research.status, status));
				if (authorId) conditions.push(eq(schema.research.authorId, authorId));
			}
			// Regular user viewing a specific other user
			else if (authorId !== undefined && authorId !== user.id) {
				conditions.push(
					eq(schema.research.status, "approved"),
					eq(schema.research.authorId, authorId),
				);
			}
			// Regular user viewing own research
			else if (authorId === user.id) {
				conditions.push(eq(schema.research.authorId, user.id));
				if (status) conditions.push(eq(schema.research.status, status));
			}
			// Regular user with status filter (no authorId)
			else if (status === "pending" || status === "rejected") {
				conditions.push(
					eq(schema.research.authorId, user.id),
					eq(schema.research.status, status),
				);
			}
			// Regular user with approved status filter
			else if (status === "approved") {
				conditions.push(eq(schema.research.status, "approved"));
			}
			// Regular user, no params: approved OR own
			else {
				conditions.push(
					or(
						eq(schema.research.status, "approved"),
						eq(schema.research.authorId, user.id),
					),
				);
			}

			if (researchType) {
				conditions.push(eq(schema.research.researchType, researchType));
			}

			const where = conditions.length > 0 ? and(...conditions) : undefined;

			const [countResult] = await db
				.select({ count: count() })
				.from(schema.research)
				.where(where);

			const results = await db.query.research.findMany({
				where,
				orderBy: [desc(schema.research.createdAt)],
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
				},
			});

			return {
				status: "ok",
				data: results.map(toResearchDto),
				meta: page.meta(countResult?.count ?? 0),
			};
		},
		{
			auth: "optional",
			query: listResearchQuery,
			response: researchListResponse,
			detail: {
				tags: ["Research"],
				summary: "List research programs",
				description:
					"Visibility depends on authentication status and role. " +
					"Anonymous sees approved only. Users see approved + their own. " +
					"Filter by authorId, status, and researchType.",
			},
		},
	)
	// Get research by id (approved = public, author sees own)
	.get(
		"/:id",
		async ({ params, user, set }) => {
			const item = await db.query.research.findFirst({
				where: eq(schema.research.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
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

			if (!item) {
				set.status = RESEARCH_ERRORS.RESEARCH_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.code,
					error: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.message,
				};
			}

			if (item.status === "approved") {
				return { status: "ok", data: toResearchDto(item) };
			}

			if (user?.role === "admin") {
				return { status: "ok", data: toResearchDto(item) };
			}

			if (user?.id !== item.authorId) {
				set.status = RESEARCH_ERRORS.RESEARCH_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.code,
					error: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.message,
				};
			}

			return { status: "ok", data: toResearchDto(item) };
		},
		{
			auth: "optional",
			detail: {
				tags: ["Research"],
				summary: "Get a research program by id",
				description:
					"Approved research is public. Admins see all. Authors see their own regardless of status.",
			},
		},
	)
	// Authenticated: create a research program
	.post(
		"/",
		async ({ user, body }) => {
			const isAdmin = user.role === "admin";
			const status: "pending" | "approved" = isAdmin ? "approved" : "pending";
			const reviewedBy: string | null = isAdmin ? user.id : null;
			const reviewedAt: Date | null = isAdmin ? new Date() : null;

			const authorId = user.id;
			const authorData = {
				id: user.id,
				name: user.name,
				image: user.image,
				major: null,
			};

			const now = new Date();
			const id = crypto.randomUUID();

			await db.insert(schema.research).values({
				id,
				title: body.title,
				content: body.content,
				researchType: body.researchType,
				institution: body.institution,
				department: body.department ?? null,
				duration: body.duration ?? null,
				funding: body.funding ?? null,
				location: body.location ?? null,
				startDate: body.startDate ? new Date(body.startDate) : null,
				deadline: body.deadline ? new Date(body.deadline) : null,
				educationLevel: body.educationLevel ?? null,
				fieldOfStudy: body.fieldOfStudy ?? null,
				experienceRequired: body.experienceRequired ?? null,
				skillsRequired: body.skillsRequired ?? null,
				additionalRequirements: body.additionalRequirements ?? null,
				status,
				rejectionReason: null,
				authorId,
				reviewedBy,
				reviewedAt,
				createdAt: now,
				updatedAt: now,
			});

			const reviewerUser = reviewedBy ? { id: user.id, name: user.name } : null;

			return {
				status: "ok",
				data: {
					id,
					title: body.title,
					content: body.content,
					researchType: body.researchType,
					institution: body.institution,
					department: body.department ?? null,
					duration: body.duration ?? null,
					funding: body.funding ?? null,
					location: body.location ?? null,
					startDate: body.startDate ?? null,
					deadline: body.deadline ?? null,
					educationLevel: body.educationLevel ?? null,
					fieldOfStudy: body.fieldOfStudy ?? null,
					experienceRequired: body.experienceRequired ?? null,
					skillsRequired: body.skillsRequired ?? null,
					additionalRequirements: body.additionalRequirements ?? null,
					status,
					author: authorData,
					reviewedBy: reviewerUser,
					rejectionReason: null,
					reviewedAt: reviewedAt?.toISOString() ?? null,
					createdAt: now.toISOString(),
					updatedAt: now.toISOString(),
				},
			};
		},
		{
			auth: true,
			body: createResearchBody,
			detail: {
				tags: ["Research"],
				summary: "Create a research program",
				description:
					"Creates a research program. Regular users get pending status. " +
					"Admin-created research is auto-approved.",
			},
		},
	)
	// Author or admin: full update. User resets to pending, admin preserves status.
	.put(
		"/:id",
		async ({ params, user, body, set }) => {
			const item = await db.query.research.findFirst({
				where: eq(schema.research.id, params.id),
			});

			if (!item) {
				set.status = RESEARCH_ERRORS.RESEARCH_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.code,
					error: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.message,
				};
			}

			if (user.id !== item.authorId && user.role !== "admin") {
				set.status = RESEARCH_ERRORS.NOT_AUTHOR.httpStatus;
				return {
					status: "error",
					code: RESEARCH_ERRORS.NOT_AUTHOR.code,
					error: RESEARCH_ERRORS.NOT_AUTHOR.message,
				};
			}

			const now = new Date();
			const isAdmin = user.role === "admin";

			await db
				.update(schema.research)
				.set({
					title: body.title,
					content: body.content,
					researchType: body.researchType,
					institution: body.institution,
					department: body.department ?? null,
					duration: body.duration ?? null,
					funding: body.funding ?? null,
					location: body.location ?? null,
					startDate: body.startDate ? new Date(body.startDate) : null,
					deadline: body.deadline ? new Date(body.deadline) : null,
					educationLevel: body.educationLevel ?? null,
					fieldOfStudy: body.fieldOfStudy ?? null,
					experienceRequired: body.experienceRequired ?? null,
					skillsRequired: body.skillsRequired ?? null,
					additionalRequirements: body.additionalRequirements ?? null,
					status: isAdmin ? item.status : "pending",
					rejectionReason: isAdmin ? item.rejectionReason : null,
					reviewedBy: isAdmin ? item.reviewedBy : null,
					reviewedAt: isAdmin ? item.reviewedAt : null,
					updatedAt: now,
				})
				.where(eq(schema.research.id, params.id));

			const updated = await db.query.research.findFirst({
				where: eq(schema.research.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
						} as const,
					},
				},
			});

			return { status: "ok", data: toResearchDto(updated!) };
		},
		{
			auth: true,
			body: updateResearchBody,
			detail: {
				tags: ["Research"],
				summary: "Update a research program",
				description:
					"Full update by the author or an admin. " +
					"User edits reset status to pending. " +
					"Admin edits preserve the existing status and review data.",
			},
		},
	)
	// Author or admin: delete a research program
	.delete(
		"/:id",
		async ({ params, user, set }) => {
			const item = await db.query.research.findFirst({
				where: eq(schema.research.id, params.id),
			});

			if (!item) {
				set.status = RESEARCH_ERRORS.RESEARCH_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.code,
					error: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.message,
				};
			}

			if (user.id !== item.authorId && user.role !== "admin") {
				set.status = RESEARCH_ERRORS.NOT_AUTHOR.httpStatus;
				return {
					status: "error",
					code: RESEARCH_ERRORS.NOT_AUTHOR.code,
					error: RESEARCH_ERRORS.NOT_AUTHOR.message,
				};
			}

			await db.delete(schema.research).where(eq(schema.research.id, params.id));

			return { status: "ok" };
		},
		{
			auth: true,
			detail: {
				tags: ["Research"],
				summary: "Delete a research program",
				description:
					"Delete a research program. Allowed for the author or an admin.",
			},
		},
	)
	// Admin: approve a research program
	.post(
		"/:id/approve",
		async ({ params, user, set }) => {
			const item = await db.query.research.findFirst({
				where: eq(schema.research.id, params.id),
			});

			if (!item) {
				set.status = RESEARCH_ERRORS.RESEARCH_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.code,
					error: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.message,
				};
			}

			const now = new Date();

			await db
				.update(schema.research)
				.set({
					status: "approved",
					reviewedBy: user.id,
					rejectionReason: null,
					reviewedAt: now,
					updatedAt: now,
				})
				.where(eq(schema.research.id, params.id));

			const updated = await db.query.research.findFirst({
				where: eq(schema.research.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
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

			return { status: "ok", data: toResearchDto(updated!) };
		},
		{
			role: "admin",
			detail: {
				tags: ["Research"],
				summary: "Approve a research program",
				description:
					"Admin approves a research program. Sets status to approved.",
			},
		},
	)
	// Admin: reject a research program
	.post(
		"/:id/reject",
		async ({ params, user, body, set }) => {
			const item = await db.query.research.findFirst({
				where: eq(schema.research.id, params.id),
			});

			if (!item) {
				set.status = RESEARCH_ERRORS.RESEARCH_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.code,
					error: RESEARCH_ERRORS.RESEARCH_NOT_FOUND.message,
				};
			}

			const now = new Date();

			await db
				.update(schema.research)
				.set({
					status: "rejected",
					reviewedBy: user.id,
					rejectionReason: body.reason,
					reviewedAt: now,
					updatedAt: now,
				})
				.where(eq(schema.research.id, params.id));

			const updated = await db.query.research.findFirst({
				where: eq(schema.research.id, params.id),
				with: {
					author: {
						columns: {
							id: true,
							name: true,
							image: true,
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

			return { status: "ok", data: toResearchDto(updated!) };
		},
		{
			role: "admin",
			body: rejectResearchBody,
			detail: {
				tags: ["Research"],
				summary: "Reject a research program",
				description:
					"Admin rejects a research program with a reason. Sets status to rejected.",
			},
		},
	);
