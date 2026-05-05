import { and, count, desc, eq, inArray, like, or } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import { OPPORTUNITIES_ERRORS } from "@/modules/opportunities/constant/opportunities-errors.constant";
import { createOpportunityBody } from "@/modules/opportunities/schema/opportunities-create.schema";
import { listOpportunitiesQuery } from "@/modules/opportunities/schema/opportunities-params.schema";
import { rejectOpportunityBody } from "@/modules/opportunities/schema/opportunities-reject.schema";
import { opportunitiesListResponse } from "@/modules/opportunities/schema/opportunities-response.schema";
import { updateOpportunityBody } from "@/modules/opportunities/schema/opportunities-update.schema";
import { toOpportunityDto } from "@/modules/opportunities/utils/opportunities.mapper";
import { USER_ERRORS } from "@/modules/users/constant/user-errors.constant";
import { authContext } from "@/plugins/auth";
import { paginate } from "@/utils/paginate";

export const opportunitiesModule = new Elysia({ prefix: "/api/opportunities" })
	.use(authContext)
	// List opportunities — public; visibility depends on auth status and role
	.get(
		"/",
		async ({ query, user }) => {
			const page = paginate(query);
			const { authorId, status, search, type } = query;
			const conditions = [];

			// Search by company or author name
			if (search) {
				const term = `%${search}%`;
				const matchedIds = await db
					.select({ id: schema.opportunity.id })
					.from(schema.opportunity)
					.leftJoin(
						schema.user,
						eq(schema.opportunity.authorId, schema.user.id),
					)
					.where(
						or(
							like(schema.opportunity.company, term),
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
						schema.opportunity.id,
						matchedIds.map((r) => r.id),
					),
				);
			}

			// Anonymous: only approved, optionally filtered by authorId
			if (!user) {
				conditions.push(eq(schema.opportunity.status, "approved"));
				if (authorId) conditions.push(eq(schema.opportunity.authorId, authorId));
			}
			// Admin: everything, optionally filtered
			else if (user.role === "admin") {
				if (status) conditions.push(eq(schema.opportunity.status, status));
				if (authorId)
					conditions.push(eq(schema.opportunity.authorId, authorId));
			}
			// Regular user viewing a specific other user
			else if (authorId !== undefined && authorId !== user.id) {
				conditions.push(
					eq(schema.opportunity.status, "approved"),
					eq(schema.opportunity.authorId, authorId),
				);
			}
			// Regular user viewing own
			else if (authorId === user.id) {
				conditions.push(eq(schema.opportunity.authorId, user.id));
				if (status) conditions.push(eq(schema.opportunity.status, status));
			}
			// Regular user with status filter (no authorId)
			else if (status === "pending" || status === "rejected") {
				conditions.push(
					eq(schema.opportunity.authorId, user.id),
					eq(schema.opportunity.status, status),
				);
			}
			// Regular user with approved status filter
			else if (status === "approved") {
				conditions.push(eq(schema.opportunity.status, "approved"));
			}
			// Regular user, no params: approved OR own
			else {
				conditions.push(
					or(
						eq(schema.opportunity.status, "approved"),
						eq(schema.opportunity.authorId, user.id),
					),
				);
			}

			if (type) {
				conditions.push(eq(schema.opportunity.type, type));
			}

			const where = conditions.length > 0 ? and(...conditions) : undefined;

			const [countResult] = await db
				.select({ count: count() })
				.from(schema.opportunity)
				.where(where);

			const opportunities = await db.query.opportunity.findMany({
				where,
				orderBy: [desc(schema.opportunity.createdAt)],
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
				data: opportunities.map(toOpportunityDto),
				meta: page.meta(countResult?.count ?? 0),
			};
		},
		{
			auth: "optional",
			query: listOpportunitiesQuery,
			response: opportunitiesListResponse,
			detail: {
				tags: ["Opportunities"],
				summary: "List opportunities",
				description:
					"Visibility depends on authentication status and role. " +
					"Anonymous sees approved only. Users see approved + their own. " +
					"Filter by authorId, status, and type.",
			},
		},
	)
	// Get opportunity by id (approved = public; author/admin see their own)
	.get(
		"/:id",
		async ({ params, user, set }) => {
			const opportunity = await db.query.opportunity.findFirst({
				where: eq(schema.opportunity.id, params.id),
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

			if (!opportunity) {
				set.status = OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.code,
					error: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.message,
				};
			}

			// Approved opportunities are public
			if (opportunity.status === "approved") {
				return { status: "ok", data: toOpportunityDto(opportunity) };
			}

			// Admin can see all
			if (user?.role === "admin") {
				return { status: "ok", data: toOpportunityDto(opportunity) };
			}

			// Author can see their own
			if (user?.id === opportunity.authorId) {
				return { status: "ok", data: toOpportunityDto(opportunity) };
			}

			// Otherwise hide non-approved opportunities
			set.status = OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.httpStatus;
			return {
				status: "error",
				code: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.code,
				error: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.message,
			};
		},
		{
			auth: "optional",
			detail: {
				tags: ["Opportunities"],
				summary: "Get an opportunity by id",
				description:
					"Approved opportunities are public. " +
					"Admins and authors can see non-approved ones.",
			},
		},
	)
	// Create an opportunity
	.post(
		"/",
		async ({ user, body, set }) => {
			const isAdmin = user.role === "admin";

			let authorId = user.id;
			let authorView = {
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
					set.status = OPPORTUNITIES_ERRORS.CANNOT_ASSIGN.httpStatus;
					return {
						status: "error",
						code: OPPORTUNITIES_ERRORS.CANNOT_ASSIGN.code,
						error: OPPORTUNITIES_ERRORS.CANNOT_ASSIGN.message,
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
				authorView = {
					id: assignedUser.id,
					name: assignedUser.name,
					image: assignedUser.image,
					major: assignedUser.major,
				};
			}

			const now = new Date();
			const id = crypto.randomUUID();

			await db.insert(schema.opportunity).values({
				id,
				type: body.type,
				company: body.company,
				contactEmail: body.contactEmail ?? null,
				applyUrl: body.applyUrl ?? null,
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
					id,
					type: body.type,
					company: body.company,
					contactEmail: body.contactEmail ?? null,
					applyUrl: body.applyUrl ?? null,
					status,
					author: authorView,
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
			body: createOpportunityBody,
			detail: {
				tags: ["Opportunities"],
				summary: "Create an opportunity",
				description:
					"Creates an opportunity. Regular users get pending status. " +
					"Admins can provide authorId to assign. " +
					"Admin-created opportunities are auto-approved.",
			},
		},
	)
	// Update an opportunity
	.put(
		"/:id",
		async ({ params, user, body, set }) => {
			const opportunity = await db.query.opportunity.findFirst({
				where: eq(schema.opportunity.id, params.id),
			});

			if (!opportunity) {
				set.status = OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.code,
					error: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.message,
				};
			}

			if (user.id !== opportunity.authorId && user.role !== "admin") {
				set.status = OPPORTUNITIES_ERRORS.NOT_AUTHOR.httpStatus;
				return {
					status: "error",
					code: OPPORTUNITIES_ERRORS.NOT_AUTHOR.code,
					error: OPPORTUNITIES_ERRORS.NOT_AUTHOR.message,
				};
			}

			const now = new Date();
			const isAdmin = user.role === "admin";

			await db
				.update(schema.opportunity)
				.set({
					type: body.type,
					company: body.company,
					contactEmail: body.contactEmail ?? null,
					applyUrl: body.applyUrl ?? null,
					status: isAdmin ? opportunity.status : "pending",
					reviewedBy: isAdmin ? opportunity.reviewedBy : null,
					reviewNotes: isAdmin ? opportunity.reviewNotes : null,
					reviewedAt: isAdmin ? opportunity.reviewedAt : null,
					updatedAt: now,
				})
				.where(eq(schema.opportunity.id, params.id));

			const updated = await db.query.opportunity.findFirst({
				where: eq(schema.opportunity.id, params.id),
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

			return { status: "ok", data: toOpportunityDto(updated!) };
		},
		{
			auth: true,
			body: updateOpportunityBody,
			detail: {
				tags: ["Opportunities"],
				summary: "Update an opportunity",
				description:
					"Full update by the author or an admin. " +
					"User edits reset status to pending. " +
					"Admin edits preserve the existing status and review data.",
			},
		},
	)
	// Delete an opportunity
	.delete(
		"/:id",
		async ({ params, user, set }) => {
			const opportunity = await db.query.opportunity.findFirst({
				where: eq(schema.opportunity.id, params.id),
			});

			if (!opportunity) {
				set.status = OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.code,
					error: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.message,
				};
			}

			if (user.id !== opportunity.authorId && user.role !== "admin") {
				set.status = OPPORTUNITIES_ERRORS.NOT_AUTHOR.httpStatus;
				return {
					status: "error",
					code: OPPORTUNITIES_ERRORS.NOT_AUTHOR.code,
					error: OPPORTUNITIES_ERRORS.NOT_AUTHOR.message,
				};
			}

			await db
				.delete(schema.opportunity)
				.where(eq(schema.opportunity.id, params.id));

			return { status: "ok" };
		},
		{
			auth: true,
			detail: {
				tags: ["Opportunities"],
				summary: "Delete an opportunity",
				description:
					"Delete an opportunity. Allowed for the author or an admin.",
			},
		},
	)
	// Admin: approve an opportunity
	.post(
		"/:id/approve",
		async ({ params, user, set }) => {
			const opportunity = await db.query.opportunity.findFirst({
				where: eq(schema.opportunity.id, params.id),
			});

			if (!opportunity) {
				set.status = OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.code,
					error: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.message,
				};
			}

			const now = new Date();

			await db
				.update(schema.opportunity)
				.set({
					status: "approved",
					reviewedBy: user.id,
					reviewNotes: null,
					reviewedAt: now,
					updatedAt: now,
				})
				.where(eq(schema.opportunity.id, params.id));

			const updated = await db.query.opportunity.findFirst({
				where: eq(schema.opportunity.id, params.id),
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

			return { status: "ok", data: toOpportunityDto(updated!) };
		},
		{
			role: "admin",
			detail: {
				tags: ["Opportunities"],
				summary: "Approve an opportunity",
				description: "Admin approves an opportunity. Sets status to approved.",
			},
		},
	)
	// Admin: reject an opportunity
	.post(
		"/:id/reject",
		async ({ params, user, body, set }) => {
			const opportunity = await db.query.opportunity.findFirst({
				where: eq(schema.opportunity.id, params.id),
			});

			if (!opportunity) {
				set.status = OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.code,
					error: OPPORTUNITIES_ERRORS.OPPORTUNITY_NOT_FOUND.message,
				};
			}

			const now = new Date();

			await db
				.update(schema.opportunity)
				.set({
					status: "rejected",
					reviewedBy: user.id,
					reviewNotes: body.reviewNotes,
					reviewedAt: now,
					updatedAt: now,
				})
				.where(eq(schema.opportunity.id, params.id));

			const updated = await db.query.opportunity.findFirst({
				where: eq(schema.opportunity.id, params.id),
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

			return { status: "ok", data: toOpportunityDto(updated!) };
		},
		{
			role: "admin",
			body: rejectOpportunityBody,
			detail: {
				tags: ["Opportunities"],
				summary: "Reject an opportunity",
				description:
					"Admin rejects an opportunity with review notes. Sets status to rejected.",
			},
		},
	);
