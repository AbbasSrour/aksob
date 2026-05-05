import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import { MAJORS_ERRORS } from "@/modules/majors/constant/majors-errors.constant";
import {
	createMajorBody,
	listMajorsQuery,
	majorResponseSchema,
	majorsListResponse,
	updateMajorBody,
} from "@/modules/majors/majors.schema";
import { authContext } from "@/plugins/auth";

const toMajorDto = (m: typeof schema.major.$inferSelect) => ({
	id: m.id,
	name: m.name,
	description: m.description,
	credits: m.credits,
	duration: m.duration,
	isActive: m.isActive,
	createdAt: m.createdAt.toISOString(),
	updatedAt: m.updatedAt.toISOString(),
});

export const majorsModule = new Elysia({ prefix: "/api/majors" })
	.use(authContext)
	// List majors (optionally filter by isActive)
	.get(
		"/",
		async ({ query }) => {
			const conditions = [];
			if (query.isActive !== undefined) {
				conditions.push(eq(schema.major.isActive, query.isActive));
			}

			const majors = await db.query.major.findMany({
				where: conditions.length > 0 ? conditions : undefined,
				orderBy: schema.major.name,
			});

			return {
				status: "ok",
				data: majors.map(toMajorDto),
			};
		},
		{
			query: listMajorsQuery,
			detail: {
				tags: ["Majors"],
				summary: "List majors",
				description:
					"Returns all majors ordered by name. Use ?isActive=true to filter.",
			},
			response: majorsListResponse,
		},
	)
	// Get major by ID
	.get(
		"/:id",
		async ({ params, set }) => {
			const m = await db.query.major.findFirst({
				where: eq(schema.major.id, params.id),
			});

			if (!m) {
				set.status = MAJORS_ERRORS.MAJOR_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: MAJORS_ERRORS.MAJOR_NOT_FOUND.code,
					error: MAJORS_ERRORS.MAJOR_NOT_FOUND.message,
				};
			}

			return { status: "ok", data: toMajorDto(m) };
		},
		{
			detail: {
				tags: ["Majors"],
				summary: "Get a major by ID",
			},
			response: majorResponseSchema,
		},
	)
	// Admin: create a major
	.post(
		"/",
		async ({ body, set }) => {
			const existing = await db.query.major.findFirst({
				where: eq(schema.major.name, body.name),
			});

			if (existing) {
				set.status = MAJORS_ERRORS.MAJOR_NAME_EXISTS.httpStatus;
				return {
					status: "error",
					code: MAJORS_ERRORS.MAJOR_NAME_EXISTS.code,
					error: MAJORS_ERRORS.MAJOR_NAME_EXISTS.message,
				};
			}

			const now = new Date();
			const id = crypto.randomUUID();

			await db.insert(schema.major).values({
				id,
				name: body.name,
				description: body.description ?? null,
				credits: body.credits ?? null,
				duration: body.duration ?? null,
				isActive: true,
				createdAt: now,
				updatedAt: now,
			});

			const created = await db.query.major.findFirst({
				where: eq(schema.major.id, id),
			});

			return { status: "ok", data: toMajorDto(created!) };
		},
		{
			auth: true,
			body: createMajorBody,
			role: "admin",
			detail: {
				tags: ["Majors"],
				summary: "Create a major",
				description:
					"Creates a new major. Name must be unique. New majors are active by default.",
			},
			response: majorResponseSchema,
		},
	)
	// Admin: update a major
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const m = await db.query.major.findFirst({
				where: eq(schema.major.id, params.id),
			});

			if (!m) {
				set.status = MAJORS_ERRORS.MAJOR_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: MAJORS_ERRORS.MAJOR_NOT_FOUND.code,
					error: MAJORS_ERRORS.MAJOR_NOT_FOUND.message,
				};
			}

			// Check for name conflict if renaming
			if (body.name && body.name !== m.name) {
				const existing = await db.query.major.findFirst({
					where: eq(schema.major.name, body.name),
				});

				if (existing) {
					set.status = MAJORS_ERRORS.MAJOR_NAME_EXISTS.httpStatus;
					return {
						status: "error",
						code: MAJORS_ERRORS.MAJOR_NAME_EXISTS.code,
						error: MAJORS_ERRORS.MAJOR_NAME_EXISTS.message,
					};
				}
			}

			const now = new Date();

			await db
				.update(schema.major)
				.set({
					name: body.name ?? m.name,
					description:
						body.description !== undefined ? body.description : m.description,
					credits: body.credits !== undefined ? body.credits : m.credits,
					duration: body.duration !== undefined ? body.duration : m.duration,
					isActive: body.isActive !== undefined ? body.isActive : m.isActive,
					updatedAt: now,
				})
				.where(eq(schema.major.id, params.id));

			const updated = await db.query.major.findFirst({
				where: eq(schema.major.id, params.id),
			});

			return { status: "ok", data: toMajorDto(updated!) };
		},
		{
			auth: true,
			body: updateMajorBody,
			role: "admin",
			detail: {
				tags: ["Majors"],
				summary: "Update a major",
				description: "Update major fields.",
			},
			response: majorResponseSchema,
		},
	)
	// Admin: delete a major (only if no users are assigned)
	.delete(
		"/:id",
		async ({ params, set }) => {
			const m = await db.query.major.findFirst({
				where: eq(schema.major.id, params.id),
			});

			if (!m) {
				set.status = MAJORS_ERRORS.MAJOR_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: MAJORS_ERRORS.MAJOR_NOT_FOUND.code,
					error: MAJORS_ERRORS.MAJOR_NOT_FOUND.message,
				};
			}

			// Check if any users are assigned to this major
			const assignedUsers = await db.query.user.findFirst({
				where: eq(schema.user.major, m.name),
			});

			if (assignedUsers) {
				set.status = MAJORS_ERRORS.MAJOR_HAS_USERS.httpStatus;
				return {
					status: "error",
					code: MAJORS_ERRORS.MAJOR_HAS_USERS.code,
					error: MAJORS_ERRORS.MAJOR_HAS_USERS.message,
				};
			}

			await db.delete(schema.major).where(eq(schema.major.id, params.id));

			return { status: "ok" };
		},
		{
			auth: true,
			role: "admin",
			detail: {
				tags: ["Majors"],
				summary: "Delete a major",
				description:
					"Deletes a major. Returns 403 if the major is still assigned to any users.",
			},
		},
	)
	// Admin: activate a major
	.post(
		"/:id/activate",
		async ({ params, set }) => {
			const m = await db.query.major.findFirst({
				where: eq(schema.major.id, params.id),
			});

			if (!m) {
				set.status = MAJORS_ERRORS.MAJOR_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: MAJORS_ERRORS.MAJOR_NOT_FOUND.code,
					error: MAJORS_ERRORS.MAJOR_NOT_FOUND.message,
				};
			}

			await db
				.update(schema.major)
				.set({ isActive: true, updatedAt: new Date() })
				.where(eq(schema.major.id, params.id));

			const updated = await db.query.major.findFirst({
				where: eq(schema.major.id, params.id),
			});

			return { status: "ok", data: toMajorDto(updated!) };
		},
		{
			auth: true,
			role: "admin",
			detail: {
				tags: ["Majors"],
				summary: "Activate a major",
				description: "Sets a major to active.",
			},
			response: majorResponseSchema,
		},
	)
	// Admin: deactivate a major
	.post(
		"/:id/deactivate",
		async ({ params, set }) => {
			const m = await db.query.major.findFirst({
				where: eq(schema.major.id, params.id),
			});

			if (!m) {
				set.status = MAJORS_ERRORS.MAJOR_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: MAJORS_ERRORS.MAJOR_NOT_FOUND.code,
					error: MAJORS_ERRORS.MAJOR_NOT_FOUND.message,
				};
			}

			await db
				.update(schema.major)
				.set({ isActive: false, updatedAt: new Date() })
				.where(eq(schema.major.id, params.id));

			const updated = await db.query.major.findFirst({
				where: eq(schema.major.id, params.id),
			});

			return { status: "ok", data: toMajorDto(updated!) };
		},
		{
			auth: true,
			role: "admin",
			detail: {
				tags: ["Majors"],
				summary: "Deactivate a major",
				description: "Sets a major to inactive.",
			},
			response: majorResponseSchema,
		},
	);
