import { and, eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { db, schema } from "@/db";
import { PROGRAMS_ERRORS } from "@/modules/programs/constant/programs-errors.constant";
import {
	createProgramBody,
	listProgramsQuery,
	programResponseSchema,
	programsListResponse,
	updateProgramBody,
} from "@/modules/programs/programs.schema";
import { authContext } from "@/plugins/auth";

const toProgramDto = (p: typeof schema.program.$inferSelect) => ({
	id: p.id,
	name: p.name,
	level: p.level,
	description: p.description,
	credits: p.credits,
	duration: p.duration,
	isActive: p.isActive,
	createdAt: p.createdAt.toISOString(),
	updatedAt: p.updatedAt.toISOString(),
});

export const programsModule = new Elysia({ prefix: "/programs" })
	.use(authContext)
	// List active programs (optionally filter by level)
	.get(
		"/",
		async ({ query }) => {
			const conditions = [eq(schema.program.isActive, true)];

			if (query.level) {
				conditions.push(eq(schema.program.level, query.level));
			}

			const programs = await db.query.program.findMany({
				where: and(...conditions),
				orderBy: schema.program.name,
			});

			return {
				status: "ok",
				data: programs.map(toProgramDto),
			};
		},
		{
			query: listProgramsQuery,
			detail: {
				tags: ["Programs"],
				summary: "List active programs",
				description:
					"Returns active programs ordered by name. Use ?level=undergraduate to filter.",
			},
			response: programsListResponse,
		},
	)
	// Get program by ID
	.get(
		"/:id",
		async ({ params, set }) => {
			const p = await db.query.program.findFirst({
				where: eq(schema.program.id, params.id),
			});

			if (!p) {
				set.status = PROGRAMS_ERRORS.PROGRAM_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: PROGRAMS_ERRORS.PROGRAM_NOT_FOUND.code,
					error: PROGRAMS_ERRORS.PROGRAM_NOT_FOUND.message,
				};
			}

			return { status: "ok", data: toProgramDto(p) };
		},
		{
			detail: {
				tags: ["Programs"],
				summary: "Get a program by ID",
			},
			response: programResponseSchema,
		},
	)
	// Admin: create a program
	.post(
		"/",
		async ({ body, set }) => {
			const existing = await db.query.program.findFirst({
				where: eq(schema.program.name, body.name),
			});

			if (existing) {
				set.status = PROGRAMS_ERRORS.PROGRAM_NAME_EXISTS.httpStatus;
				return {
					status: "error",
					code: PROGRAMS_ERRORS.PROGRAM_NAME_EXISTS.code,
					error: PROGRAMS_ERRORS.PROGRAM_NAME_EXISTS.message,
				};
			}

			const now = new Date();
			const id = crypto.randomUUID();

			await db.insert(schema.program).values({
				id,
				name: body.name,
				level: body.level,
				description: body.description ?? null,
				credits: body.credits ?? null,
				duration: body.duration ?? null,
				isActive: true,
				createdAt: now,
				updatedAt: now,
			});

			const created = await db.query.program.findFirst({
				where: eq(schema.program.id, id),
			});

			return { status: "ok", data: toProgramDto(created!) };
		},
		{
			auth: true,
			body: createProgramBody,
			role: "admin",
			detail: {
				tags: ["Programs"],
				summary: "Create a program",
				description:
					"Creates a new program. Name must be unique. New programs are active by default.",
			},
			response: programResponseSchema,
		},
	)
	// Admin: update a program (including isActive toggle)
	.put(
		"/:id",
		async ({ params, body, set }) => {
			const p = await db.query.program.findFirst({
				where: eq(schema.program.id, params.id),
			});

			if (!p) {
				set.status = PROGRAMS_ERRORS.PROGRAM_NOT_FOUND.httpStatus;
				return {
					status: "error",
					code: PROGRAMS_ERRORS.PROGRAM_NOT_FOUND.code,
					error: PROGRAMS_ERRORS.PROGRAM_NOT_FOUND.message,
				};
			}

			// Check for name conflict if renaming
			if (body.name && body.name !== p.name) {
				const existing = await db.query.program.findFirst({
					where: eq(schema.program.name, body.name),
				});

				if (existing) {
					set.status = PROGRAMS_ERRORS.PROGRAM_NAME_EXISTS.httpStatus;
					return {
						status: "error",
						code: PROGRAMS_ERRORS.PROGRAM_NAME_EXISTS.code,
						error: PROGRAMS_ERRORS.PROGRAM_NAME_EXISTS.message,
					};
				}
			}

			const now = new Date();

			await db
				.update(schema.program)
				.set({
					name: body.name ?? p.name,
					level: body.level ?? p.level,
					description:
						body.description !== undefined ? body.description : p.description,
					credits: body.credits !== undefined ? body.credits : p.credits,
					duration: body.duration !== undefined ? body.duration : p.duration,
					isActive: body.isActive !== undefined ? body.isActive : p.isActive,
					updatedAt: now,
				})
				.where(eq(schema.program.id, params.id));

			const updated = await db.query.program.findFirst({
				where: eq(schema.program.id, params.id),
			});

			return { status: "ok", data: toProgramDto(updated!) };
		},
		{
			auth: true,
			body: updateProgramBody,
			role: "admin",
			detail: {
				tags: ["Programs"],
				summary: "Update a program",
				description:
					"Update program fields. Toggle isActive to activate/deactivate.",
			},
			response: programResponseSchema,
		},
	);
